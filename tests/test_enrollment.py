import json
import pytest
from unittest.mock import MagicMock

def setup_mock_supabase(mocker, route_path):
    mock_supabase = mocker.patch(f'{route_path}.supabase')
    mock_query = MagicMock()
    mock_supabase.table.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[])
    return mock_supabase, mock_query

def test_enroll_new_user(client, mocker):
    """Test Case: Enrolling a student into a career for the first time."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.student_routes')
    
    # 1. First call (select) returns empty data
    # 2. Second call (insert) executes
    mock_query.execute.side_effect = [
        MagicMock(data=[]), # Not existing
        MagicMock() # Insert execution
    ]
    
    payload = {"user_id": "student123", "career_id": 10}
    response = client.post('/api/enroll', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify insert was called
    mock_supabase.table.assert_any_call('roadmap')
    mock_query.insert.assert_called_with({"user_id": "student123", "career_id": 10, "status": "active"})

def test_enroll_already_exists(client, mocker):
    """Test Case: Enrolling a student who is already enrolled."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.student_routes')
    
    # Select returns existing data
    mock_query.execute.return_value = MagicMock(data=[{"user_id": "student123", "career_id": 10}])
    
    payload = {"user_id": "student123", "career_id": 10}
    response = client.post('/api/enroll', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify insert was NOT called
    mock_query.insert.assert_not_called()

def test_enroll_missing_data(client, mocker):
    """Test Case: Enrolling with missing user_id or career_id."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.student_routes')
    
    # Supabase might throw an error if we pass None to eq()
    mock_query.execute.side_effect = Exception("Invalid input")
    
    payload = {"user_id": None}
    response = client.post('/api/enroll', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 500
    assert data['success'] is False
    assert "Invalid input" in data['error']
