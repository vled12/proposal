__version__ = '0.1.0'
__author__ = 'Vladislav Voytenok'
__licence__ = 'GNU'

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# Flask configuration
templates = os.path.join(os.path.dirname(__file__), 'templates')
print('Templates folder is ' + templates)
server = Flask(__name__, static_url_path='', static_folder=os.getcwd(), template_folder=templates)
server.config.from_object('srv_cfg')

# Jinja2 configuration
server.jinja_options["line_statement_prefix"] = "#"
server.jinja_options["line_comment_prefix"] = "##"
server.create_jinja_environment()

# Flask_SQLAlchemy configuration
db = SQLAlchemy(server)

# Flask_Login configuration
lm = LoginManager()
lm.init_app(server)
lm.login_view = 'login'
