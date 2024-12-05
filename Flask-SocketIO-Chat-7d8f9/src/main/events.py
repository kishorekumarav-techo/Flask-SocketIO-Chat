from time import time
from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio
from flasgger import swag_from

@socketio.on('joined', namespace='/chat')
@swag_from({
    'tags': ['chat'],
    'description': 'Sent by clients when they enter a room. A status message is broadcast to all people in the room.',
    'parameters': [
        {
            'name': 'message',
            'in': 'body',
            'description': 'Message data',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'room': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Status message broadcasted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def joined(message):
    """
    Handle client joining a chat room.
    Broadcast a status message to all people in the room.
    """
    room = session.get('room')
    join_room(room)
    emit('status', {
        'msg': f"{session.get('name')} has entered the room.",
    }, to=room)

@socketio.on('text', namespace='/chat')
@swag_from({
    'tags': ['chat'],
    'description': 'Sent by a client when the user entered a new message. The message is sent to all people in the room.',
    'parameters': [
        {
            'name': 'message',
            'in': 'body',
            'description': 'Message data',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Message broadcasted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def text(message):
    """
    Handle new messages sent by clients.
    Broadcast the message to all people in the room.
    """
    room = session.get('room')
    emit('message', {
        'msg': f"{session.get('name')}: {message['msg']}",
    }, to=room)

@socketio.on('left', namespace='/chat')
@swag_from({
    'tags': ['chat'],
    'description': 'Sent by clients when they leave a room. A status message is broadcast to all people in the room.',
    'parameters': [
        {
            'name': 'message',
            'in': 'body',
            'description': 'Message data',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'room': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Status message broadcasted successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string'}
                }
            }
        }
    }
})
def left(message):
    """
    Handle client leaving a chat room.
    Broadcast a status message to all people in the room.
    """
    room = session.get('room')
    leave_room(room)
    emit('status', {
        'msg': f"{session.get('name')} has left the room.",
    }, to=room)