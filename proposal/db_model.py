from proposal import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# Формирование структуры баз данных пользователей
ROLE_USER = 0
ROLE_ADMIN = 1
ROLE_DEV = 2


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    role = db.Column(db.SmallInteger, default=ROLE_USER)
    password_hash = db.Column(db.String(128))
    userQueries = db.relationship('UserQuery', backref='author', lazy='dynamic')

    #is_active = True
    #is_authenticated = True

    def __repr__(self):
        return '<User %r>' % self.nickname

   # def get_id(self):
    #    return self.email

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class UserQuery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(4096))
    timestamp = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Query %r>' % self.body
