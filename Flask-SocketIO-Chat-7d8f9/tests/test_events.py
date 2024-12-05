import unittest
from unittest.mock import MagicMock, patch
from collections import defaultdict

# Mock implementations
class MockSession(dict):
    def get(self, key, default=None):
        return super().get(key, default)

class MockSocketIO:
    def __init__(self):
        self.handlers = defaultdict(list)

    def on(self, event, namespace=None):
        def decorator(f):
            self.handlers[namespace].append((event, f))
            return f
        return decorator

class MockEmit:
    def __init__(self):
        self.calls = []

    def __call__(self, event, data, to=None):
        self.calls.append((event, data, to))

def mock_join_room(room):
    pass

def mock_leave_room(room):
    pass

def mock_swag_from(config):
    def decorator(f):
        return f
    return decorator

# Actual implementation
socketio = MockSocketIO()
session = MockSession()
emit = MockEmit()
join_room = mock_join_room
leave_room = mock_leave_room
swag_from = mock_swag_from

@socketio.on('joined', namespace='/chat')
@swag_from({})
def joined(message):
    room = session.get('room')
    join_room(room)
    emit('status', {
        'msg': f"{session.get('name')} has entered the room.",
    }, to=room)

@socketio.on('text', namespace='/chat')
@swag_from({})
def text(message):
    room = session.get('room')
    emit('message', {
        'msg': f"{session.get('name')}: {message['msg']}",
    }, to=room)

@socketio.on('left', namespace='/chat')
@swag_from({})
def left(message):
    room = session.get('room')
    leave_room(room)
    emit('status', {
        'msg': f"{session.get('name')} has left the room.",
    }, to=room)

# Test suite
class TestChatEvents(unittest.TestCase):
    def setUp(self):
        self.socketio = socketio
        self.session = session
        self.emit = emit
        self.session.clear()
        self.emit.calls.clear()

    def test_joined(self):
        self.session['name'] = 'John'
        self.session['room'] = 'Test Room'
        
        joined({})
        
        self.assertEqual(len(self.emit.calls), 1)
        event, data, to = self.emit.calls[0]
        self.assertEqual(event, 'status')
        self.assertEqual(data['msg'], 'John has entered the room.')
        self.assertEqual(to, 'Test Room')

    def test_text(self):
        self.session['name'] = 'John'
        self.session['room'] = 'Test Room'
        
        text({'msg': 'Hello, world!'})
        
        self.assertEqual(len(self.emit.calls), 1)
        event, data, to = self.emit.calls[0]
        self.assertEqual(event, 'message')
        self.assertEqual(data['msg'], 'John: Hello, world!')
        self.assertEqual(to, 'Test Room')

    def test_left(self):
        self.session['name'] = 'John'
        self.session['room'] = 'Test Room'
        
        left({})
        
        self.assertEqual(len(self.emit.calls), 1)
        event, data, to = self.emit.calls[0]
        self.assertEqual(event, 'status')
        self.assertEqual(data['msg'], 'John has left the room.')
        self.assertEqual(to, 'Test Room')

if __name__ == '__main__':
    unittest.main()