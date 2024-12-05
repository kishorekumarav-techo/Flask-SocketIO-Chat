#!/usr/bin/env python
from flask import Flask
from flask_socketio import SocketIO
from flasgger import Swagger

def create_app(debug=False):
    app = Flask(__name__)
    app.debug = debug
    app.config['SECRET_KEY'] = 'secret!'
    app.config['SWAGGER'] = {
        'title': 'Flask-SocketIO Chat API',
        'uiversion': 3
    }
    Swagger(app)
    return app

app = create_app(debug=True)
socketio = SocketIO(app)

@app.route('/')
def index():
    """
    Home page
    ---
    responses:
      200:
        description: Returns the home page
    """
    return "Welcome to Flask-SocketIO Chat"

if __name__ == '__main__':
    socketio.run(app)