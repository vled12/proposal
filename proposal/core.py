import argparse
import configparser
import json
import sys
import types
from re import compile as re_compile

import requests
from flask import request, render_template, render_template_string, send_file, send_from_directory, redirect, url_for, \
    flash, g, abort
from flask_login import login_user, logout_user, current_user, login_required
from pypandoc import get_pandoc_version
from werkzeug.utils import secure_filename

# Internal dependencies
from .tools import *

from . import server, db, lm
from .case_change import convert_file as change_file_case
from .db_model import User, ROLE_USER, ROLE_ADMIN, ROLE_DEV
from .login import LoginForm, RegistrationForm, EditUserForm


parser = argparse.ArgumentParser(description='Launch service.',
                                 usage='''proposal <port> [<args>]
                                ''')
parser.add_argument('port', help='Port to serve')
parser.add_argument('--nonsecure', '-n', action='store_true', help='Run non-secured, just http')
parser.add_argument('--debug', '-D', action='store_true', help='Debugging mode')

args = parser.parse_args(sys.argv[1:])

# Module directory
module_path = os.path.dirname(__file__)

# File upload rules
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'docx'}

# Server configuration
config = configparser.ConfigParser()
config.read('run.cfg')


@server.before_request
def before_request():
    g.user = current_user
    """if not request.is_secure:# and app.env != "development":
        print("Found http request. Redirecting..")
        url = request.url.replace("http://", "https://", 1)
        code = 301
        return redirect(url, code=code)"""


@server.after_request
def add_header(r):
    if args.debug:
        """
        Add headers to both force latest IE rendering engine or Chrome Frame,
       and also to cache the rendered page for 10 minutes.
       """
        r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        r.headers["Pragma"] = "no-cache"
        r.headers["Expires"] = "0"
        r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@server.route('/')
@login_required
def index():
    products = os.listdir("static/questionnaire/")
    if args.debug:
        print("Product list:", products)
    return render_template('index.htm', products=products)


@server.route("/get/<type>", methods=["GET", "POST"])
@login_required
def show_result(type):
    query = {k: v if len(v) > 1 else v[0] for k, v in request.values.to_dict(flat=False).items()}
    if args.debug:
        print(query)
    
    if type == 'cfg':
        with open("tmp/cfg.json", 'w+', encoding='utf-8') as f:
            # f.write(request.get_data(cache=True, as_text=True, parse_form_data=False))
            f.write(json.dumps(query))
        return send_file(os.getcwd() + '/tmp/cfg.json', as_attachment=True)
    
    query = {k: v for k, v in query.items() if v != "off"}
    
    lang = query['lang']
    product = query['product']
    if not query.get('delivery'):
        query['delivery'] = {}
    else:
        query['delivery'] = list2dictID(json.loads(query['delivery']))
    
    # Extract amount value according to text in the beginning
    numIndex = re_compile(r"\s*\[(\d+)\]\s*(.*)")

    for id, item in query['delivery'].items():
        matchNum = numIndex.match(item["text"])
        if matchNum:
            item.update({"amount": int(matchNum.groups()[0])})
            # Remove numText
            item["text"] = matchNum.groups()[1]
        else:
            item.update({"amount": 1})
        # Also extract description
        matchDescr = item["text"].split("<br>")
        if len(matchDescr) > 1:
            # Add new field
            item.update({"description": matchDescr[1]})
            item["text"] = matchDescr[0]
    
    if type == 'template':
        text = query["TemplateText"]  # .replace('\n','<br>\n') #работает не стабильно с line statement
        return render_template_string(text, set=query)
    
    text_path = "static/text/" + product + "/"
    
    if query.get("wiki_link") and query['wiki_link'] != '':
        wikilink = query['wiki_link'] + "?action=render"
        try:
            with requests.get(wikilink) as response:
                with open(text_path + lang + "_03_wiki.htm", 'wb+') as wiki:
                    wiki.write(response.content)
                tree = html.parse(text_path + lang + "_03_wiki.htm",
                                  parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
                with open(text_path + lang + "_03_wiki.htm", 'wb+') as wiki:
                    infobox = tree.xpath("//table[contains(@class,'infobox')]")[0]
                    wiki.write(
                        html.tostring(infobox, pretty_print=True, encoding='utf-8'))  # delete anything but infobox
        except requests.exceptions.ConnectionError or requests.exceptions.MissingSchema:
            print("wiki info is not available")
    else:
        try:
            os.remove(text_path + lang + "_03_wiki.htm")
        except FileNotFoundError:
            pass
    
    # tree = html.parse(wikilink)
    # res = requests.get('http://en.wikipedia.org/wiki/Bratsk_Hydroelectric_Power_Station')
    # tree = html.parse(res.content)
    # print(res.content)
    
    articles = [text_path + x for x in sorted(os.listdir(text_path)) if
                (x[0] != '.') and (x[:2] == lang or x[:3] == 'all')]
    
    if DEV:
        with open("tmp/template.html", 'w+', encoding='utf-8') as f:
            f.write(put_in_body(articles))
    
    with open("tmp/print.html", 'w+', encoding='utf-8') as f:
        f.write(render_template_string(put_in_body(articles), set=query))
    
    add_glossary('tmp/print.html', 'static/dict.csv')
    
    if type == "preview":
        return send_file(os.getcwd() + '/tmp/print.html')  # render_template('result.htm', set=set)
    if type == "pdf" or type == "docx":
        # with open("print.html", 'w', encoding='utf-8') as f:
        #    f.write(render_template('result.htm', set=set))
        htm2x("tmp/print.html", type, lang, query.get('CompactVersion'))
        # , mimetype="application/pdf"
        # , attachment_filename="print.pdf"
        return send_file(os.getcwd() + '/tmp/print.' + type, as_attachment=True)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@server.route('/convert-file', methods=['GET', 'POST'])
@login_required
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            fullname = os.path.join(server.config['UPLOAD_FOLDER'], filename)
            file.save(fullname)
            change_file_case(fullname, "tmp/converted.docx")
            return send_file(os.getcwd() + '/tmp/converted.docx', as_attachment=True)
    return ""


@server.route('/static/js/<path:filename>')
def send_js(filename):
    return send_from_directory(mod_path + '/static/js', filename)


@server.route('/static/js/defaultDelivery.js')
@login_required
def send_defaultDelivery_js():
    return send_from_directory(os.getcwd() + '/static/js', "defaultDelivery.js")


@server.route('/static/css/<path:filename>')
def send_css(filename):
    return send_from_directory(mod_path + '/static/css', filename)


@server.route('/static/lib/<path:filename>')
def send_lib(filename):
    return send_from_directory(mod_path + '/static/lib', filename)


@lm.user_loader
def load_user(user_id):
    print("Searching for User ID:", user_id)
    # return User.query.filter_by(email=user_id).first()
    return User.query.get(int(user_id))


@server.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect('/')
    form = LoginForm()
    if form.validate_on_submit():
        if form.email.data is None or form.email.data == "":
            flash('Invalid login. Please try again.')
            return redirect(url_for('login'))
        user = User.query.filter_by(email=form.email.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        
        login_user(user, remember=form.remember_me.data)
        flash('Logged in successfully.')
        
        return redirect(url_for('index'))
    elif form.email.data is not None and form.email.data != "":
        flash('Некорректный ввод данных. Повторите снова.')
    
    return render_template('login.htm',
                           title='Login to system',
                           form=form)


@server.route("/logout")
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect('/login')


@server.route('/admin', methods=['GET', 'POST'])
@login_required
def admin_panel():
    # Forbid access
    if current_user.role != ROLE_ADMIN:
        return abort(403)
    
    regForm = RegistrationForm()
    editForm = EditUserForm()
    if regForm.validate_on_submit() and regForm.register.data:
        newUser = User(nickname=regForm.username.data, email=regForm.email.data, role=regForm.role.data)
        newUser.set_password(regForm.password.data)
        db.session.add(newUser)
        db.session.commit()
        flash('User added successfully.')
    
    if editForm.validate_on_submit() and editForm.edit.data:
        editUser = User.query.filter_by(id=editForm.id.data).first()
        email = editUser.email
        db.session.query(User).filter(User.id == editForm.id.data).delete()
        db.session.commit()
        flash('User {:s} deleted.'.format(email))
    
    return render_template('admin.htm',
                           title='Система администрирования',
                           regform=regForm, editform=editForm, userList=User.query)


@server.route('/editor', methods=['GET', 'POST'])
@login_required
def editor():
    return render_template('editor.htm')


def start():
    # Print used modules
    if args.debug:
        def imports():
            for name, val in list(globals().items()):
                if isinstance(val, types.ModuleType):
                    yield val
        
        for module in imports():
            try:
                print("Using module " + module.__name__ + " version " + module.__version__)
            except AttributeError:
                print("Using module " + module.__name__ + " with no particular version")
    
    server.jinja_env.globals.update(remove_from_list=remove_from_list, unique_list=unique_list)
    
    if "tmp" not in os.listdir("."):
        os.mkdir("tmp")  # Create temporary folder
    
    try:
        print("Pandoc installed version:", get_pandoc_version())
    except OSError:
        print("Installing pandoc to default location")
        pypandoc.download_pandoc(delete_installer=True)
    
    server.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    server.config['SESSION_COOKIE_SAMESITE'] = "Strict"
    server.view_functions['static'] = login_required(server.send_static_file)
    server.run(host="0.0.0.0", port=os.environ.get('PORT', args.port)
               , debug=args.debug
               , ssl_context='adhoc' if not args.nonsecure else None
               , threaded=True)
