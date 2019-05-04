import io, os, subprocess, json
import requests
from flask import Flask, request, render_template, send_file
from lxml import html, etree

DEV = True

server = Flask(__name__)
server.config['TEMPLATES_AUTO_RELOAD'] = True


delivery="""
[{
                    "id": "ga",
                    "text": "САУ ГА",
                    "icon": "fa fa-briefcase",
                    "li_attr": {
                        "id": "ga"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "ga_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "#",
                    "type": "system"
                }, {
                    "id": "j1_5",
                    "text": "ПТК ТА-ТИСУ-ВО Шкаф ТА",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_5"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_5_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_20",
                    "text": "СИГН",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_20"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_20_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_5",
                    "type": "function"
                }, {
                    "id": "j1_6",
                    "text": "ТА",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_6"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_6_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_5",
                    "type": "function"
                }, {
                    "id": "j1_7",
                    "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_7"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_7_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_8",
                    "text": "ИЗМ",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_8"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_8_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_7",
                    "type": "function"
                }, {
                    "id": "j1_9",
                    "text": "ТК",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_9"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_9_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_7",
                    "type": "function"
                }, {
                    "id": "j1_10",
                    "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО ТИСУ",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_10"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_10_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_29",
                    "text": "ТК",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_29"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_29_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_10",
                    "type": "function"
                }, {
                    "id": "j1_17",
                    "text": "ПТК Енисей ВК",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_17"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_17_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_18",
                    "text": "ВК",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_18"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_18_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_17",
                    "type": "function"
                }, {
                    "id": "j1_26",
                    "text": "Шкаф защиты ошиновки",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_26"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_26_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_27",
                    "text": "ШЗО",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_27"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_27_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_26",
                    "type": "function"
                }, {
                    "id": "j1_25",
                    "text": "Шкаф защиты трансформатора",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_25"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_25_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_28",
                    "text": "ШЗТ",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_28"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_28_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_25",
                    "type": "function"
                }, {
                    "id": "j1_21",
                    "text": "Шкаф защиты генератора",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_21"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_21_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_24",
                    "text": "ШЗГ",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_24"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_24_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_21",
                    "type": "function"
                }, {
                    "id": "j1_2",
                    "text": "ПТК ЭГР-МНУ Шкаф ЭГР-МНУ",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_2"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_2_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_3",
                    "text": "ЭГР",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_3"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_3_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_2",
                    "type": "function"
                }, {
                    "id": "j1_4",
                    "text": "МНУ",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_4"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_4_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_2",
                    "type": "function"
                }, {
                    "id": "j1_12",
                    "text": "ШИС",
                    "icon": "fa fa-wrench",
                    "li_attr": {
                        "id": "j1_12"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_12_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": true,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "ga",
                    "type": "sub"
                }, {
                    "id": "j1_16",
                    "text": "ЭИ",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_16"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_16_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_12",
                    "type": "function"
                }, {
                    "id": "j1_13",
                    "text": "ЭС",
                    "icon": "fa fa-flash",
                    "li_attr": {
                        "id": "j1_13"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_13_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": true,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "j1_12",
                    "type": "function"
                }, {
                    "id": "j1_14",
                    "text": "ОС",
                    "icon": "fa fa-briefcase",
                    "li_attr": {
                        "id": "j1_14"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_14_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": false,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "#",
                    "type": "system"
                }, {
                    "id": "j1_15",
                    "text": "ВУ",
                    "icon": "fa fa-briefcase",
                    "li_attr": {
                        "id": "j1_15"
                    },
                    "a_attr": {
                        "href": "#",
                        "id": "j1_15_anchor"
                    },
                    "state": {
                        "loaded": true,
                        "opened": false,
                        "selected": false,
                        "disabled": false
                    },
                    "data": {},
                    "parent": "#",
                    "type": "system"
                }]
                """

import types
def imports():
    for name, val in list(globals().items()):
        if isinstance(val, types.ModuleType):
             yield val



def align_images(input):
    prototype=open("static/mat/img.prototype.htm").read()
    for image in input.xpath(".//img[not(ancestor::*[@class='infobox'])]"):
        replacement=etree.XML(prototype)
        try:
            #replacement.xpath(".//img")[0].attrib["alt"]=image.attrib["alt"]
            replacement.xpath(".//h4")[0].text=image.attrib["alt"]#FIX ME: evade hardlink to h4 tag
        except(KeyError):
            if DEV: print("Image caption (alt) not found")
        #replacement.xpath(".//img")[0].attrib["src"]=image.attrib["src"]
        re_image=replacement.xpath(".//img")[0]
        for attr in image.attrib:
            re_image.set(attr,image.attrib[attr])
        image.getparent().replace(image,replacement)

def list2dictID(data):
    result={}
    for item in data:
        result[item["id"]]=item
    return result

def put_in_body(args):
    tree = html.parse("wrappers/main.htm", parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
    body = tree.xpath(".//body")[0]

    for x in args:
        print(x)
        article = html.parse(x, parser=html.HTMLParser(encoding='utf-8')).getroot()#xpath("///html/body/article")[0]  # find first article in html
        align_images(article)
        body.append(article)
    # with open(result_file, "wb") as f:
    #    f.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))
    return io.BytesIO(html.tostring(tree, pretty_print=True, encoding='utf-8'))


def htm2x(f, type, lang):
    #delete cell spaning cause of pandoc no support
    tree = html.parse(f, parser=html.HTMLParser(encoding='utf-8', compact=True))
    for table in tree.xpath(".//table"):
        firstrow=table.xpath(".//tr")[0]
        for cell in firstrow.getchildren():
            try:
                for i in range(1,int(cell.attrib["colspan"])):
                    firstrow.append(etree.XML("<td></td>"))
            except(KeyError):
                pass
    etree.strip_attributes(tree,"class","style","colspan","rowspan")
    with open(f, 'wb') as file:
        file.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))

    subprocess.run([cfg['pandoc']['location'],'-o','tmp/print.'+type,f,'--reference-doc=.\/static\/mat\/templates\/'+lang+'_msword.'+type])

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
    #dec=json.JSONDecoder()

    #set={k:v if len(v)>1 else v[0] for k,v in dec.raw_decode(delivery)[0].items()}
    set={}
    set['delivery']=list2dictID(json.loads(delivery))
    print(set['delivery'])

    return render_template('test.htm', set=set )

@server.route("/get/<type>", methods=["GET", "POST"])
def show_result(type):
    set={k:v if len(v)>1 else v[0] for k,v in request.values.to_dict(flat=False).items()}
    if DEV: print(set)
    lang = set['lang']
    set['delivery']=list2dictID(json.loads(set['delivery']))
    print(set['delivery'])
    if set['wiki_link']!='':        
        wikilink = set['wiki_link']+"?action=render"
        try:
            with requests.get(wikilink) as response:
                with open("static/mat/text/ru_03_wiki.htm", 'wb') as wiki:
                    wiki.write(response.content)
                tree = html.parse("static/mat/text/ru_03_wiki.htm", parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
                with open("static/mat/text/ru_03_wiki.htm", 'wb') as wiki:
                    infobox = tree.xpath("//table[@class='infobox']")[0]
                    wiki.write(html.tostring(infobox, pretty_print=True, encoding='utf-8'))#delete anything but infobox
        except(requests.exceptions.ConnectionError):
            print("wiki info is not available")

    #tree = html.parse(wikilink)
    #res = requests.get('http://en.wikipedia.org/wiki/Bratsk_Hydroelectric_Power_Station')
    #tree = html.parse(res.content)
    #print(res.content)

    
    articles = ["static/mat/text/" + x for x in sorted(os.listdir("static/mat/text")) if (x[0] != '.') and (x[:2] == lang)]
    with open("templates/tmp/result.htm", 'wb+') as f:
        f.write(put_in_body(articles).read())
    with open("tmp/print.htm", 'w+', encoding='utf-8') as f:
        f.write(render_template('tmp/result.htm', set=set))
    add_glossary('tmp/print.htm', 'static/mat/dict.csv')
    if type == "preview":
        return send_file('tmp/print.htm')  # render_template('result.htm', set=set)
    if type == "pdf" or type == "docx":
        #with open("print.htm", 'w', encoding='utf-8') as f:
        #    f.write(render_template('result.htm', set=set))
        htm2x("tmp/print.htm", type, lang)
        # , mimetype="application/pdf"
        # , attachment_filename="print.pdf"
        return send_file('tmp/print.' + type, as_attachment=True)


#@server.after_request
#def add_header(r):
#    if DEV:
#        """
#        Add headers to both force latest IE rendering engine or Chrome Frame,
#       and also to cache the rendered page for 10 minutes.
#       """
#        r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#        r.headers["Pragma"] = "no-cache"
#        r.headers["Expires"] = "0"
#        r.headers['Cache-Control'] = 'public, max-age=0'
#        return r


if __name__ == "__main__":
    with open('config.json') as json_data_file:
	    cfg = json.load(json_data_file)
	    print(cfg)
	
    for module in imports():
	    try: 
	        print("using module "+module.__name__+" version "+module.__version__)
	    except(AttributeError):
	        print("using module "+module.__name__+" with no particular version")

    server.run(host="0.0.0.0", port=os.environ.get('PORT', 5000))


	
