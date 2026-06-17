import pytest
import sys
import os

# Add backend directory to path so we can import the app
# Adjusted to find backend folder relative to this file
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
sys.path.append(backend_path)

from app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    flask_app.config.update({
        "TESTING": True,
    })
    
    # We yield the app instance for use in other fixtures/tests
    yield flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()
