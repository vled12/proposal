"""
HTTPie - a CLI, cURL-like tool for humans.

"""
__version__ = '0.1.0-dev'
__author__ = 'Vladislav Voytenok'
__licence__ = 'GNU'

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# Инстанс сервера
server = Flask(__name__, static_url_path='', static_folder=os.getcwd(), template_folder=os.getcwd()+'\\templates/')
print(server.template_folder)
server.config.from_object('srv_cfg')
# Инстанс базы данных
db = SQLAlchemy(server)
#загружаем классы - таблицы БД
from tkp.db_model import User, UserQuery

lm = LoginManager()
lm.init_app(server)
lm.login_view = 'login'