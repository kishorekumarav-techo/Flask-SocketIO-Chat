import unittest
from unittest.mock import MagicMock, patch

# Mock implementations
class MockFlaskForm:
    pass

class MockStringField:
    def __init__(self, label, validators=None):
        self.label = label
        self.validators = validators or []

class MockSubmitField:
    def __init__(self, label):
        self.label = label

class MockDataRequired:
    pass

# Implementation code
class LoginForm(MockFlaskForm):
    """Accepts a nickname and a room."""
    name = MockStringField('Name', validators=[MockDataRequired()])
    room = MockStringField('Room', validators=[MockDataRequired()])
    submit = MockSubmitField('Enter Chatroom')

# Test suite
class TestLoginForm(unittest.TestCase):
    def setUp(self):
        self.form = LoginForm()

    def test_form_fields(self):
        self.assertTrue(hasattr(self.form, 'name'))
        self.assertTrue(hasattr(self.form, 'room'))
        self.assertTrue(hasattr(self.form, 'submit'))

    def test_name_field(self):
        self.assertIsInstance(self.form.name, MockStringField)
        self.assertEqual(self.form.name.label, 'Name')
        self.assertEqual(len(self.form.name.validators), 1)
        self.assertIsInstance(self.form.name.validators[0], MockDataRequired)

    def test_room_field(self):
        self.assertIsInstance(self.form.room, MockStringField)
        self.assertEqual(self.form.room.label, 'Room')
        self.assertEqual(len(self.form.room.validators), 1)
        self.assertIsInstance(self.form.room.validators[0], MockDataRequired)

    def test_submit_field(self):
        self.assertIsInstance(self.form.submit, MockSubmitField)
        self.assertEqual(self.form.submit.label, 'Enter Chatroom')

if __name__ == '__main__':
    unittest.main()