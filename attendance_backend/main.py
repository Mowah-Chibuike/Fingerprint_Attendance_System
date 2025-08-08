from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user, user_logged_in

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/home')
def index():
    return render_template('index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', username=current_user.username)