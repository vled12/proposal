import os
from flask import Flask, request, render_template, send_file
from lxml import html, etree



server=Flask(__name__)
server.config['TEMPLATES_AUTO_RELOAD'] = True

def squeeze(result_file,*args):
    tree = html.parse("wrappers/main.htm", parser=html.HTMLParser(encoding='utf-8',compact=False,recover=False))
    body = tree.xpath(".//body")[0]

    for x in args:
        article = html.parse(x, parser=html.HTMLParser(encoding='utf-8')).xpath("//html/body/article")[0]
        body.append(article)
    with open(result_file,"wb") as f:
        f.write(html.tostring(tree, pretty_print=True,encoding='utf-8'))

@server.route('/')
def static_page():
    return render_template('index.htm')

@server.route("/get/<type>",methods=["GET","POST"])
def show_result(type):
    set=request.values.to_dict()
    print(set)
    print(type)
    docs = ["text/" + x for x in os.listdir("text") if x[0]!='.']
    squeeze("templates/result.htm", *docs)
    if type=="preview":
        return render_template('result.htm',set=set)
    if type == "pdf" or type == "docx":
        output_from_parsed_template = render_template('result.htm',set=set)
        with open("print.htm",'w',encoding='utf-8') as f:
            f.write(output_from_parsed_template)
        os.system('python .venv\\Scripts\\unoconv -f '+type+' print.htm')
        #, mimetype="application/pdf"
        #, attachment_filename="print.pdf"
        return send_file('print.'+type, as_attachment=True)

    #return ""
#application/vnd.openxmlformats-officedocument.wordprocessingml.document
@server.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


if __name__=="__main__":
    server.run(host="0.0.0.0", port=os.environ.get('PORT', 5000))
