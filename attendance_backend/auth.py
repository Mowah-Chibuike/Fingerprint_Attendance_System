from flask import Blueprint, render_template, request, redirect, url_for
from .models import Admin
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user

auth = Blueprint('auth', __name__)

@auth.route('/signup')
def signup():
    return render_template('signup.html')

@auth.route('/signup', methods=['POST'])
def signup_post():
    fullname = request.form.get('fullname')
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')

    admin = Admin.query.filter_by(username=username).first()
    if admin:
        print("Admin already exists")
        redirect(url_for('auth.login'))
    else:
        new_admin = Admin(full_name=fullname, username=username, email=email, password=generate_password_hash(password))
        db.session.add(new_admin)
        db.session.commit()

    return redirect(url_for('auth.login'))


@auth.route('/login')
def login():
    return render_template('login.html')

@auth.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    password = request.form.get('password')

    admin = Admin.query.filter_by(username=username).first()

    print(admin)
    if not admin or not check_password_hash(admin.password, password):
        return redirect(url_for('auth.login'))
    
    login_user(admin)
    return redirect(url_for('main.dashboard'))

@auth.route('/logout')
@login_required
def logout():
    current_user.device = None
    db.session.commit()
    logout_user()
    return redirect(url_for('auth.login'))