import io, os, subprocess
from flask import Flask, request, render_template, send_file
from lxml import html, etree

DEV = True

server = Flask(__name__)
server.config['TEMPLATES_AUTO_RELOAD'] = True


def put_in_body(args):
    tree = html.parse("wrappers/main.htm", parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
    body = tree.xpath(".//body")[0]

    for x in args:
        article = html.parse(x, parser=html.HTMLParser(encoding='utf-8')).getroot()#xpath("///html/body/article")[0]  # find first article in html
        body.append(article)
    # with open(result_file, "wb") as f:
    #    f.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))
    return io.BytesIO(html.tostring(tree, pretty_print=True, encoding='utf-8'))


def htm2x(f, type):
    subprocess.run(['python', 'unoconv', '-f', type, f])


def add_glossary(page, dict):
    dic={}
    with open(dict,'r',encoding='utf-8') as vocF:
        for line in vocF:
            (key,value)=line.split(';')
            dic[key]=value
    glossary={}
    with open(page, 'r',encoding='utf-8') as inF:
        for line in inF:
            for key,value in dic.items():
                if (key in line) and not key in glossary:### FIXME: Change to REGEX
                    if DEV: print('found',key)
                    glossary[key]=value
    result= html.parse(page, parser=html.HTMLParser(encoding='utf-8'))
    glossary_table = result.find("//table[@id='glossary']")
    for key,value in sorted(glossary.items()):
        row="<tr><td>"+key+"</td><td>"+value+"</td></tr>"
        glossary_table.append(etree.XML(row))
    result.write(page,pretty_print=True, encoding='utf-8')

@server.route('/')
def static_page():
    return render_template('index.htm')

@server.route("/get/<type>", methods=["GET", "POST"])
def show_result(type):
    set={k:v if len(v)>1 else v[0] for k,v in request.values.to_dict(flat=False).items()}
    if DEV: print(set)
    lang = set['lang']

    print(type)
    articles = ["text/" + x for x in sorted(os.listdir("text")) if (x[0] != '.') and (x[:2] == lang)]
    with open("templates/result.htm", 'wb') as f:
        f.write(put_in_body(articles).read())
    with open("print.htm", 'w', encoding='utf-8') as f:
        f.write(render_template('result.htm', set=set))
    add_glossary('print.htm', 'static/dict.csv')
    if type == "preview":
        return send_file('print.htm')  # render_template('result.htm', set=set)
    if type == "pdf" or type == "docx":
        #with open("print.htm", 'w', encoding='utf-8') as f:
        #    f.write(render_template('result.htm', set=set))
        htm2x("print.htm", type)
        # , mimetype="application/pdf"
        # , attachment_filename="print.pdf"
        return send_file('print.' + type, as_attachment=True)


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


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=os.environ.get('PORT', 5000))
