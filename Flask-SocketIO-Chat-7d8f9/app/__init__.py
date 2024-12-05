from flask import Flask
from flask_socketio import SocketIO
from flask_swagger_ui import get_swaggerui_blueprint

socketio = SocketIO()

def create_app(debug=False):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.debug = debug
    app.config['SECRET_KEY'] = 'gjr39dkjn344_!67#'

    # Register main blueprint
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # Configure Swagger UI
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Flask-SocketIO-Chat API"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # Initialize SocketIO with the app
    socketio.init_app(app)

    return app