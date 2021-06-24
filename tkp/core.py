import os
import json
import requests
import types
import configparser
import argparse
import sys
import re
from pathlib import Path
from flask import request, render_template, render_template_string, send_file, send_from_directory, redirect, url_for, session, flash, g, abort
from flask_login import login_user, logout_user, current_user, login_required
from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, PasswordField, SubmitField, IntegerField
from wtforms.validators import DataRequired, ValidationError, Email, EqualTo
from werkzeug.utils import secure_filename

from tkp import server, db, lm

from tkp.db_model import User, ROLE_USER, ROLE_ADMIN

# Рабочая конфигурация
DEV = True
# Рабочая директория
mod_path = os.path.dirname(__file__)

# правила загрузки файлов
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'docx'}


def imports():
    for name, val in list(globals().items()):
        if isinstance(val, types.ModuleType):
            yield val


# Конфигурация бэкенда
config = configparser.ConfigParser()
config.read('run.cfg')
os.environ.setdefault('PYPANDOC_PANDOC', config['pandoc']['location'])

# Загружаем внутренние библиотеки
from tkp.tools import *
import tkp.case_change


# Форма входа
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email("Пожалуйста введи e-mail адрес")])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('remember_me', default=False)
    login = SubmitField('Login')


# Форма добавления пользователя
class RegistrationForm(FlaskForm):
    username = StringField('User')  # , validators=[DataRequired()])
    email = StringField('E-mail')  # , validators=[DataRequired(), Email()])
    password = PasswordField('Password')  # , validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password')  # , validators=[DataRequired(), EqualTo('password')])
    register = SubmitField('Register')

    def validate_username(self, username):
        user = User.query.filter_by(nickname=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')


# Форма редактирования пользователя
class EditUserForm(FlaskForm):
    id = IntegerField('User ID')  # , validators=[DataRequired()])
    edit = SubmitField('Delete user')


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
    if DEV:
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
    return render_template('index.htm')

#@server.route('/static/mat/questionnaire/<template>.htm')
#@login_required
#def questionnaire(template):
    #return render_template('static/mat/questionnaire/'+template+'.htm')
    #return Template(open('static/mat/questionnaire/'+template+'.htm', encoding='utf-8').read()).render()

@server.route("/get/<type>", methods=["GET", "POST"])
@login_required
def show_result(type):
    query = {k: v if len(v) > 1 else v[0] for k, v in request.values.to_dict(flat=False).items()}
    if DEV:
        print(query)

    if type == 'cfg':
        with open("tmp/cfg.json", 'w+', encoding='utf-8') as f:
            # f.write(request.get_data(cache=True, as_text=True, parse_form_data=False))
            f.write(json.dumps(query))
        return send_file(os.getcwd() + '/tmp/cfg.json', as_attachment=True)

    lang = query['lang']
    query['delivery'] = list2dictID(json.loads(query['delivery']))

    #Extract amount value according to text in the beginning
    for id,item in query['delivery'].items():
        numIndex = re.compile("(\s*\[\d+\]\s*)")
        match = numIndex.match(item["text"])
        if match:
            numText = match.groups()[0]
            #Remove chars [ and ] and whitespaces
            num = int("".join(numText.replace(']','').replace('[','').split()))
            item.update({"amount": num})
            #Remove numText
            item["text"] = item["text"].replace(numIndex,"")
        else:
            item.update({"amount": 1})


    if type == 'template':
        text = query["TemplateText"]#.replace('\n','<br>\n') #работает не стабильно с line statement
        return render_template_string(text, set=query)

    if query['wiki_link'] != '':
        wikilink = query['wiki_link'] + "?action=render"
        try:
            with requests.get(wikilink) as response:
                with open("static/mat/text/" + lang + "_03_wiki.htm", 'wb+') as wiki:
                    wiki.write(response.content)
                tree = html.parse("static/mat/text/" + lang + "_03_wiki.htm",
                                  parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
                with open("static/mat/text/" + lang + "_03_wiki.htm", 'wb+') as wiki:
                    infobox = tree.xpath("//table[contains(@class,'infobox')]")[0]
                    wiki.write(
                        html.tostring(infobox, pretty_print=True, encoding='utf-8'))  # delete anything but infobox
        except requests.exceptions.ConnectionError or requests.exceptions.MissingSchema:
            print("wiki info is not available")
    else:
        try:
            os.remove("static/mat/text/" + lang + "_03_wiki.htm")
        except FileNotFoundError:
            pass

    # tree = html.parse(wikilink)
    # res = requests.get('http://en.wikipedia.org/wiki/Bratsk_Hydroelectric_Power_Station')
    # tree = html.parse(res.content)
    # print(res.content)

    articles = ["static/mat/text/" + x for x in sorted(os.listdir("static/mat/text")) if
                (x[0] != '.') and (x[:2] == lang)]

    with open("templates/tmp/result.htm", 'wb+') as f:
        f.write(put_in_body(articles).read())

    with open("tmp/print.html", 'w+', encoding='utf-8') as f:
        f.write(render_template('tmp/result.htm', set=query))
    add_glossary('tmp/print.html', 'static/mat/dict.csv')
    # возможное решение по обработке jinja тегов с картиками
    # rendered = html.parse('tmp/print.html',
    #                   parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
    # align_images(rendered)
    # rendered.write('tmp/print.html', pretty_print=True, encoding='utf-8')
    if type == "preview":
        return send_file(os.getcwd() + '/tmp/print.html')  # render_template('result.htm', set=set)
    if type == "pdf" or type == "docx":
        # with open("print.html", 'w', encoding='utf-8') as f:
        #    f.write(render_template('result.htm', set=set))
        htm2x("tmp/print.html", type, lang, config['pandoc']['location'])
        # , mimetype="application/pdf"
        # , attachment_filename="print.pdf"
        return send_file(os.getcwd() + '/tmp/print.' + type, as_attachment=True)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@server.route('/convert-file', methods=['GET', 'POST'])
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
            tkp.case_change.convert_file(fullname, "tmp/converted.docx")
            return send_file(os.getcwd() + '/tmp/converted.docx', as_attachment=True)
    return ""


@server.route('/js/<path:filename>')
# @login_required
def send_js(filename):
    return send_from_directory(mod_path + '/static/js', filename)


@server.route('/css/<path:filename>')
# @login_required
def send_css(filename):
    return send_from_directory(mod_path + '/static/css', filename)

@server.route('/lib/<path:filename>')
# @login_required
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
        next = request.args.get('next')

        # is_safe_url should check if the url is safe for redirects.
        # See http://flask.pocoo.org/snippets/62/ for an example.
        # if not is_safe_url(next):
        #    return flask.abort(400)

        # return redirect(next or url_for('index'))
        return redirect(url_for('index'))
    elif form.email.data is not None and form.email.data != "":
        flash('Некорректный ввод данных. Повторите снова.')

    return render_template('login.htm',
                           title='Вход в систему',
                           form=form)


@server.route("/logout")
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect('/login')


@server.route('/admin', methods=['GET', 'POST'])
def admin_panel():
    # Forbid access
    if not current_user.is_authenticated or current_user.role != ROLE_ADMIN:
        return abort(403)

    regForm = RegistrationForm()
    editForm = EditUserForm()
    if regForm.validate_on_submit() and regForm.register.data:
        newUser = User(nickname=regForm.username.data, email=regForm.email.data, role=ROLE_USER)
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

def remove_from_list(x, l):
    for _ in range(l.count(x)):
        l.remove(x)
    return 0

def unique_list(seq):
    return list(set(seq))

def main(args=sys.argv[1:]):
    # Print used modules
    for module in imports():
        try:
            print("using module " + module.__name__ + " version " + module.__version__)
        except(AttributeError):
            print("using module " + module.__name__ + " with no particular version")

    parser = argparse.ArgumentParser(description='Launch service server.',
                                     usage='''tkp <port> [<args>]
                                         
    ''')
    parser.add_argument('port', help='Port to serve')
    parser.add_argument('-n', '--nonsecure', action='store_true', help='Run non-secured, just http')

    args = parser.parse_args(sys.argv[1:])

    server.jinja_env.globals.update(remove_from_list=remove_from_list, unique_list=unique_list)

    if "tmp" not in os.listdir("templates/"):
        os.mkdir("templates/tmp") # create temporary folder
    if "tmp" not in os.listdir("."):
        os.mkdir("tmp") # create temporary folder

    server.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    server.run(host="0.0.0.0", port=os.environ.get('PORT', args.port)
               # ,   ssl_context=('cert.pem', 'key.pem')
               , ssl_context=('adhoc') if not args.nonsecure else None
               , threaded=True)

