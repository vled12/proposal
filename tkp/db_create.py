#!flask/bin/python
from migrate.versioning import api
from srv_cfg import SQLALCHEMY_DATABASE_URI
from srv_cfg import SQLALCHEMY_MIGRATE_REPO
from tkp import db
import os.path

db.create_all()
if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
    api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
    api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
else:
    api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))