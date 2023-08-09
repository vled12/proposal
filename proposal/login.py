from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, PasswordField, SubmitField, IntegerField, RadioField
from wtforms.validators import DataRequired, ValidationError, Email, EqualTo
from .db_model import User, ROLE_USER, ROLE_ADMIN, ROLE_DEV


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email("Пожалуйста введи e-mail адрес")])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('remember_me', default=False)
    login = SubmitField('Login')


class RegistrationForm(FlaskForm):
    username = StringField('User', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    role = RadioField('Role',
                      choices=[(ROLE_USER, "Пользователь"), (ROLE_ADMIN, "Администратор"), (ROLE_DEV, "Разработчик")],
                      default=ROLE_USER, validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    register = SubmitField('Register')
    
    def validate_username(self, username):
        user = User.query.filter_by(nickname=username.data).first()
        if user is not None:
            raise ValidationError('Данное имя пользователя уже используется.')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Данный почтовый адрес уже используется.')


class EditUserForm(FlaskForm):
    id = IntegerField('User ID')  # , validators=[DataRequired()])
    edit = SubmitField('Delete user')
