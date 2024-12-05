import unittest
from unittest.mock import MagicMock

# Mock implementations
class FlaskForm:
    pass

class StringField:
    def __init__(self, label, validators=None):
        self.label = label
        self.validators = validators or []
        self.data = ''

class SubmitField:
    def __init__(self, label):
        self.label = label

class DataRequired:
    def __init__(self, message=None):
        self.message = message

class Length:
    def __init__(self, min=None, max=None, message=None):
        self.min = min
        self.max = max
        self.message = message

# Actual implementation
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

# Test suite
class TestLoginForm(unittest.TestCase):
    def setUp(self):
        self.form = LoginForm()

    def test_form_fields(self):
        self.assertTrue(hasattr(self.form, 'name'))
        self.assertTrue(hasattr(self.form, 'room'))
        self.assertTrue(hasattr(self.form, 'submit'))

    def test_name_field(self):
        self.assertIsInstance(self.form.name, StringField)
        self.assertEqual(self.form.name.label, 'Name')
        self.assertEqual(len(self.form.name.validators), 2)
        self.assertIsInstance(self.form.name.validators[0], DataRequired)
        self.assertIsInstance(self.form.name.validators[1], Length)
        self.assertEqual(self.form.name.validators[0].message, "Name is required.")
        self.assertEqual(self.form.name.validators[1].min, 2)
        self.assertEqual(self.form.name.validators[1].max, 50)
        self.assertEqual(self.form.name.validators[1].message, "Name must be between 2 and 50 characters.")

    def test_room_field(self):
        self.assertIsInstance(self.form.room, StringField)
        self.assertEqual(self.form.room.label, 'Room')
        self.assertEqual(len(self.form.room.validators), 2)
        self.assertIsInstance(self.form.room.validators[0], DataRequired)
        self.assertIsInstance(self.form.room.validators[1], Length)
        self.assertEqual(self.form.room.validators[0].message, "Room name is required.")
        self.assertEqual(self.form.room.validators[1].min, 2)
        self.assertEqual(self.form.room.validators[1].max, 50)
        self.assertEqual(self.form.room.validators[1].message, "Room name must be between 2 and 50 characters.")

    def test_submit_field(self):
        self.assertIsInstance(self.form.submit, SubmitField)
        self.assertEqual(self.form.submit.label, 'Enter Chatroom')

    def test_valid_input(self):
        form = LoginForm()
        form.name.data = "John Doe"
        form.room.data = "General"
        self.assertTrue(self.validate_form(form))

    def test_invalid_name_too_short(self):
        form = LoginForm()
        form.name.data = "A"
        form.room.data = "General"
        self.assertFalse(self.validate_form(form))

    def test_invalid_name_too_long(self):
        form = LoginForm()
        form.name.data = "A" * 51
        form.room.data = "General"
        self.assertFalse(self.validate_form(form))

    def test_invalid_room_too_short(self):
        form = LoginForm()
        form.name.data = "John Doe"
        form.room.data = "A"
        self.assertFalse(self.validate_form(form))

    def test_invalid_room_too_long(self):
        form = LoginForm()
        form.name.data = "John Doe"
        form.room.data = "A" * 51
        self.assertFalse(self.validate_form(form))

    def validate_form(self, form):
        # Simple validation logic
        name_valid = 2 <= len(form.name.data) <= 50
        room_valid = 2 <= len(form.room.data) <= 50
        return name_valid and room_valid

if __name__ == '__main__':
    unittest.main()