from flask import session, redirect, url_for, render_template, request
from flask_swagger_ui import get_swaggerui_blueprint
from . import main
from .forms import LoginForm
from flasgger import swag_from

# Set up Swagger UI
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Flask-SocketIO-Chat"
    }
)
main.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@main.route('/', methods=['GET', 'POST'])
@swag_from({
    'responses': {
        200: {
            'description': 'Successful response',
            'schema': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string'},
                    'room': {'type': 'string'}
                }
            }
        }
    },
    'parameters': [
        {
            'name': 'name',
            'in': 'formData',
            'type': 'string',
            'required': 'true',
            'description': 'User name'
        },
        {
            'name': 'room',
            'in': 'formData',
            'type': 'string',
            'required': 'true',
            'description': 'Chat room name'
        }
    ]
})
def index():
    """Login form to enter a room."""
    form = LoginForm()
    if form.validate_on_submit():
        session['name'] = form.name.data
        session['room'] = form.room.data
        return redirect(url_for('.chat'))
    elif request.method == 'GET':
        form.name.data = session.get('name', '')
        form.room.data = session.get('room', '')
    return render_template('index.html', form=form)

@main.route('/chat')
@swag_from({
    'responses': {
        200: {
            'description': 'Successful response',
            'schema': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string'},
                    'room': {'type': 'string'}
                }
            }
        }
    }
})
def chat():
    """Chat room. The user's name and room must be stored in
    the session."""
    name = session.get('name', '')
    room = session.get('room', '')
    if name == '' or room == '':
        return redirect(url_for('.index'))
    return render_template('chat.html', name=name, room=room)