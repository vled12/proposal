"""
HTTPie - a CLI, cURL-like tool for humans.

"""
__version__ = '0.1.0-dev'
__author__ = 'Vladislav Voytenok'
__licence__ = 'GNU'

import os
from pathlib import Path
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# Инстанс сервера
templates = Path.cwd().joinpath('templates')
print(f'Templates folder is {templates}')
server = Flask(__name__, static_url_path='', static_folder=os.getcwd(), template_folder=templates)
server.config.from_object('srv_cfg')
# Конфигурация Jinja2
server.jinja_options["line_statement_prefix"] = "#"
server.jinja_options["line_comment_prefix"] = "##"
server.create_jinja_environment()
#print(server.jinja_environment.)
# Инстанс базы данных
db = SQLAlchemy(server)
#загружаем классы - таблицы БД
from tkp.db_model import User, UserQuery

lm = LoginManager()
lm.init_app(server)
lm.login_view = 'login'