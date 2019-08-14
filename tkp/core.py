import io, os, subprocess
import json
import requests
import configparser
from flask import Flask, request, render_template, send_file, send_from_directory
from lxml import html, etree

DEV = True

config = configparser.ConfigParser()

server = Flask(__name__, static_url_path='', static_folder=os.getcwd())
server.config['TEMPLATES_AUTO_RELOAD'] = True

mod_path = os.path.dirname(__file__)

cfg = {}

import types


def imports():
    for name, val in list(globals().items()):
        if isinstance(val, types.ModuleType):
            yield val


def align_images(input):
    prototype = open("static/mat/img.prototype.htm").read()
    for image in input.xpath(".//img[not(ancestor::*[@class='infobox'])]"):
        replacement = etree.XML(prototype)
        try:
            # replacement.xpath(".//img")[0].attrib["alt"]=image.attrib["alt"]
            replacement.xpath(".//h4")[0].text = image.attrib["alt"]  # FIX ME: evade hardlink to h4 tag
        except(KeyError):
            if DEV: print("Image caption (alt) not found")
        # replacement.xpath(".//img")[0].attrib["src"]=image.attrib["src"]
        re_image = replacement.xpath(".//img")[0]
        for attr in image.attrib:
            re_image.set(attr, image.attrib[attr])
        image.getparent().replace(image, replacement)


def list2dictID(data):
    result = {}
    for item in data:
        result[item["id"]] = item
    return result


def put_in_body(args):
    tree = html.parse(mod_path + "/wrappers/main.htm",
                      parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
    body = tree.xpath(".//body")[0]

    for x in args:
        print(x)
        article = html.parse(x, parser=html.HTMLParser(
            encoding='utf-8')).getroot()  # xpath("///html/body/article")[0]  # find first article in html
        align_images(article)
        body.append(article)
    # with open(result_file, "wb") as f:
    #    f.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))
    return io.BytesIO(html.tostring(tree, pretty_print=True, encoding='utf-8'))


def htm2x(f, type, lang):
    # delete cell spaning cause of pandoc no support
    tree = html.parse(f, parser=html.HTMLParser(encoding='utf-8', compact=True))
    for table in tree.xpath(".//table"):
        firstrow = table.xpath(".//tr")[0]
        for cell in firstrow.getchildren():
            try:
                for i in range(1, int(cell.attrib["colspan"])):
                    firstrow.append(etree.XML("<td></td>"))
            except(KeyError):
                pass
    etree.strip_attributes(tree, "class", "style", "colspan", "rowspan")
    with open(f, 'wb') as file:
        file.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))

    subprocess.run([config['pandoc']['location'],'-o','tmp/print.'+type,f,'--reference-doc=.\/static\/mat\/templates\/'+lang+'_msword.'+type])
    #subprocess.run(['d:\/distr\/pandoc-2.7-windows-x86_64\/pandoc.exe', '-o', 'tmp/print.' + type, f, '--reference-doc=.\/static\/mat\/templates\/' + lang + '_msword.' + type])


def add_glossary(page, dict):
    dic = {}
    with open(dict, 'r', encoding='utf-8') as vocF:
        for line in vocF:
            (key, value) = line.split(';')
            dic[key] = value
    glossary = {}
    with open(page, 'r', encoding='utf-8') as inF:
        for line in inF:
            for key, value in dic.items():
                if (key in line) and not key in glossary:  ### FIXME: Change to REGEX
                    if DEV: print('found', key)
                    glossary[key] = value
    result = html.parse(page, parser=html.HTMLParser(encoding='utf-8'))
    glossary_table = result.find("//table[@id='glossary']")
    for key, value in sorted(glossary.items()):
        row = "<tr><td>" + key + "</td><td>" + value + "</td></tr>"
        glossary_table.append(etree.XML(row))
    result.write(page, pretty_print=True, encoding='utf-8')


@server.route('/')
def static_page():
    return render_template('index.htm')


@server.route("/get/<type>", methods=["GET", "POST"])
def show_result(type):
    set = {k: v if len(v) > 1 else v[0] for k, v in request.values.to_dict(flat=False).items()}
    if DEV: print(set)
    lang = set['lang']
    set['delivery'] = list2dictID(json.loads(set['delivery']))
    print(set['delivery'])
    if set['wiki_link'] != '':
        wikilink = set['wiki_link'] + "?action=render"
        try:
            with requests.get(wikilink) as response:
                with open("static/mat/text/"+lang+"_03_wiki.htm", 'wb') as wiki:
                    wiki.write(response.content)
                tree = html.parse("static/mat/text/"+lang+"_03_wiki.htm",
                                  parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
                with open("static/mat/text/"+lang+"_03_wiki.htm", 'wb') as wiki:
                    infobox = tree.xpath("//table[contains(@class,'infobox')]")[0]
                    wiki.write(
                        html.tostring(infobox, pretty_print=True, encoding='utf-8'))  # delete anything but infobox
        except(requests.exceptions.ConnectionError):
            print("wiki info is not available")

    # tree = html.parse(wikilink)
    # res = requests.get('http://en.wikipedia.org/wiki/Bratsk_Hydroelectric_Power_Station')
    # tree = html.parse(res.content)
    # print(res.content)

    articles = ["static/mat/text/" + x for x in sorted(os.listdir("static/mat/text")) if
                (x[0] != '.') and (x[:2] == lang)]
    with open(mod_path + "/templates/tmp/result.htm", 'wb+') as f:
        f.write(put_in_body(articles).read())
    with open("tmp/print.htm", 'w+', encoding='utf-8') as f:
        f.write(render_template('tmp/result.htm', set=set))
    add_glossary('tmp/print.htm', 'static/mat/dict.csv')
    if type == "preview":
        return send_file(os.getcwd() + '/tmp/print.htm')  # render_template('result.htm', set=set)
    if type == "pdf" or type == "docx":
        # with open("print.htm", 'w', encoding='utf-8') as f:
        #    f.write(render_template('result.htm', set=set))
        htm2x("tmp/print.htm", type, lang)
        # , mimetype="application/pdf"
        # , attachment_filename="print.pdf"
        return send_file(os.getcwd() + '/tmp/print.' + type, as_attachment=True)


@server.route('/js/<path:filename>')
def send_js(filename):
    return send_from_directory(mod_path + '/static/js', filename)


@server.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory(mod_path + '/static/css', filename)


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


def main():

    config.read('run.cfg')

    for module in imports():
        try:
            print("using module " + module.__name__ + " version " + module.__version__)
        except(AttributeError):
            print("using module " + module.__name__ + " with no particular version")

    server.run(host="0.0.0.0", port=os.environ.get('PORT', 5000))
