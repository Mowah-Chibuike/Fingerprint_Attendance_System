from flask import Flask
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager

class Base(DeclarativeBase):
  pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres.xdqdvdzphujdvvmrcvnp:zNHVIZP6FZZeMhem@aws-0-eu-north-1.pooler.supabase.com:5432/postgres'
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)


    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    from .models import Admin
    @login_manager.user_loader
    def load_user(user_id):
       return Admin.query.get(int(user_id))

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from .endpoints import endpoints as endpoint_blueprint
    app.register_blueprint(endpoint_blueprint)

    return app