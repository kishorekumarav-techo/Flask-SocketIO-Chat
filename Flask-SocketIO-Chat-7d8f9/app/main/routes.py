from flask import session, redirect, url_for, render_template, request
from flask_restx import Namespace, Resource, fields
from . import main
from .forms import LoginForm

api = Namespace('main', description='Main routes')

login_model = api.model('Login', {
    'name': fields.String(required=True, description='User name'),
    'room': fields.String(required=True, description='Chat room name')
})

@api.route('/')
class Index(Resource):
    @api.doc(description='Login form to enter a room.')
    @api.expect(login_model)
    def get(self):
        """Get the login form."""
        form = LoginForm()
        form.name.data = session.get('name', '')
        form.room.data = session.get('room', '')
        return render_template('index.html', form=form)

    @api.doc(description='Process the login form.')
    @api.expect(login_model)
    def post(self):
        """Process the login form and redirect to chat."""
        form = LoginForm()
        if form.validate_on_submit():
            session['name'] = form.name.data
            session['room'] = form.room.data
            return redirect(url_for('.chat'))
        return render_template('index.html', form=form)

@api.route('/chat')
class Chat(Resource):
    @api.doc(description="Chat room. The user's name and room must be stored in the session.")
    def get(self):
        """Get the chat room."""
        name = session.get('name', '')
        room = session.get('room', '')
        if name == '' or room == '':
            return redirect(url_for('.index'))
        return render_template('chat.html', name=name, room=room)

# Register the namespace with the main blueprint
main.add_namespace(api)