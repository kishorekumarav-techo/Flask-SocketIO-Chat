from flask import Flask
from flask_socketio import SocketIO
from flasgger import Swagger

socketio = SocketIO()

def create_app(debug=False):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.debug = debug
    app.config['SECRET_KEY'] = 'gjr39dkjn344_!67#'  # Consider using environment variables for sensitive data

    # Initialize Swagger
    Swagger(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    socketio.init_app(app)
    return app