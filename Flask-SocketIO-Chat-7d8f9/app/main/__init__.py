from flask import Blueprint
from flask_restx import Api

main = Blueprint('main', __name__)
api = Api(main, doc='/api/docs', title='Flask-SocketIO-Chat API', version='1.0', description='API for Flask-SocketIO-Chat application')

from . import routes, events