from flask_wtf import FlaskForm
from wtforms.fields import StringField, SubmitField
from wtforms.validators import DataRequired, Length


class LoginForm(FlaskForm):
    """
    Accepts a nickname and a room for chat login.
    
    Attributes:
        name (StringField): Field for user's name
        room (StringField): Field for chat room name
        submit (SubmitField): Button to submit the form
    """
    name = StringField('Name', validators=[DataRequired(), Length(min=1, max=50)])
    room = StringField('Room', validators=[DataRequired(), Length(min=1, max=50)])
    submit = SubmitField('Enter Chatroom')