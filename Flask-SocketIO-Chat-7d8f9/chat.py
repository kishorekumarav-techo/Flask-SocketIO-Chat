#!/usr/bin/env python
from src import create_app, socketio
from flask_swagger_ui import get_swaggerui_blueprint

app = create_app(debug=True)

# Swagger configuration
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

if __name__ == '__main__':
    socketio.run(app)