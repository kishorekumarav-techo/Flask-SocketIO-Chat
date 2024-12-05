from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField
from wtforms.validators import DataRequired, Length

class LoginForm(FlaskForm):
    """
    Form for user login and room selection.
    
    Attributes:
        name (StringField): Field for user's name.
        room (StringField): Field for chat room name.
        submit (SubmitField): Button to submit the form.
    """
    name = StringField('Name', validators=[
        DataRequired(message="Name is required."),
        Length(min=2, max=50, message="Name must be between 2 and 50 characters.")
    ])
    room = StringField('Room', validators=[
        DataRequired(message="Room name is required."),
        Length(min=2, max=50, message="Room name must be between 2 and 50 characters.")
    ])
    submit = SubmitField('Enter Chatroom')