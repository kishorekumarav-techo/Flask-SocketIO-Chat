from flask import Blueprint
from flasgger import swag_from

main = Blueprint('main', __name__)

@swag_from({
    'tags': ['Main'],
    'description': 'Main blueprint initialization',
    'responses': {
        '200': {
            'description': 'Main blueprint successfully initialized'
        }
    }
})
def init_main_blueprint():
    """Initialize the main blueprint."""
    from . import routes, events

init_main_blueprint()