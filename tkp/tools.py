import os, subprocess, io
import re
from lxml import html, etree
import pypandoc
from shutil import copyfileobj
from tempfile import TemporaryFile

#Рабочая конфигурация
DEV = True
# Рабочая директория
mod_path = os.path.dirname(__file__)

def align_images(input):#TODO убрать сьедание соседних jinja тегов
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
    tree = html.parse("wrappers/main.htm",
                      parser=html.HTMLParser(encoding='utf-8', compact=False, recover=False))
    body = tree.xpath(".//body")[0]

    for x in args:
        print(x)

        """ Left in seeking for solution with bug when file ends with one-line jinja statement
        fx = TemporaryFile('w+', encoding='utf-8')
        with open(x, encoding='utf-8') as f:
            copyfileobj(f, fx)
        # add line break in the file
        fx.seek(0, 2)
        fx.write('\n')
        fx.seek(0)
        fx.close()
        """

        article = html.parse(x, parser=html.HTMLParser(
        encoding='utf-8')).getroot()  # xpath("///html/body/article")[0]  # find first article in html

        align_images(article)
        body.append(article)
    # with open(result_file, "wb") as f:
    #    f.write(html.tostring(tree, pretty_print=True, encoding='utf-8'))
    text = html.tostring(tree, pretty_print=True, encoding='unicode').replace('&gt;','>').replace('&lt;','<')
    return io.BytesIO(bytes(text, encoding='utf-8'))


def htm2x(f, type, lang, location):
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

    pypandoc.convert_file(source_file="tmp/print.html", to='docx',outputfile='tmp/print.docx',
                         extra_args=["--reference-doc","static/mat/templates/"+lang+"_msword.docx"])
    #subprocess.run([location,'-o','tmp/print.'+type,f,'--reference-doc=.\/static\/mat\/templates\/'+lang+'_msword.'+type])
    #subprocess.run(['d:\/distr\/pandoc-2.7-windows-x86_64\/pandoc.exe', '-o', 'tmp/print.' + type, f, '--reference-doc=.\/static\/mat\/templates\/' + lang + '_msword.' + type])


def add_glossary(page, dict):
    result = html.parse(page, parser=html.HTMLParser(encoding='utf-8'))
    glossary_table = result.find("//table[@id='glossary']")
    if glossary_table:
        dic = {}
        with open(dict, 'r', encoding='utf-8') as vocF:
            for line in vocF:
                (key, value) = line.split(';')
                dic[key] = value
        glossary = {}
        with open(page, 'r', encoding='utf-8') as inF:
            #Convert to string
            data = inF.read().replace('\n', '')

            #Get rid of comments and jinja templates
            data = re.sub("(<!--.*?-->)|({{%}}.*?%})", "", data, flags=re.DOTALL)
            for key, value in dic.items():
                if re.search(r'\W'+key, data):
                    if DEV: print('found', key)
                    glossary[key] = value
        for key, value in sorted(glossary.items()):
            row = "<tr><td>" + key + "</td><td>" + value + "</td></tr>"
            glossary_table.append(etree.XML(row))
        result.write(page, pretty_print=True, encoding='utf-8')