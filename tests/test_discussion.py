import pytest
import json
from unittest.mock import MagicMock

# ============================================================================
# 1. TEST SUITE: NETWORKING & POST LIFECYCLE
# ============================================================================

def test_create_job_post_lifecycle(client, mocker):
    """
    Case: Submit post_type: 'job'.
    Expected: Backend forces status: 'pending'.
    """
    # ⚡ Mock Supabase
    mock_supabase = mocker.patch('routes.discussion_routes.supabase')
    mock_execute = MagicMock()
    mock_execute.execute.return_value = MagicMock(data=[{"id": "test-id", "status": "pending"}])
    mock_supabase.table.return_value.insert.return_value = mock_execute

    payload = {
        "author_id": "alumni-123",
        "title": "AI Engineer at Grab",
        "content": "Apply now!",
        "post_type": "job"
    }

    response = client.post('/api/discussion/posts', 
                           data=json.dumps(payload), 
                           content_type='application/json')

    # Verify logic
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['success'] is True
    
    # Assert the insert call included status='pending'
    # We inspect the call arguments directly
    args, _ = mock_supabase.table.return_value.insert.call_args
    assert args[0]['status'] == 'pending'

def test_create_mentorship_post_lifecycle(client, mocker):
    """
    Case: Submit post_type: 'mentorship'.
    Expected: Backend forces status: 'approved'.
    """
    mock_supabase = mocker.patch('routes.discussion_routes.supabase')
    mock_execute = MagicMock()
    mock_execute.execute.return_value = MagicMock(data=[{"id": "test-id", "status": "approved"}])
    mock_supabase.table.return_value.insert.return_value = mock_execute

    payload = {
        "author_id": "alumni-123",
        "title": "Career Advice session",
        "content": "Let's chat about SE roles.",
        "post_type": "mentorship"
    }

    response = client.post('/api/discussion/posts', 
                           data=json.dumps(payload), 
                           content_type='application/json')

    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['success'] is True
    
    # Assert the insert call included status='approved'
    args, _ = mock_supabase.table.return_value.insert.call_args
    assert args[0]['status'] == 'approved'

def test_author_aware_visibility(client, mocker):
    """
    Case: GET /api/discussion/all?user_id=Alumnus_A
    Expected: Returns all approved + Alumnus_A's pending posts.
    """
    mock_supabase = mocker.patch('routes.discussion_routes.supabase')
    
    # Mock mixed database response
    mock_data = [
        {"id": "1", "status": "approved", "author_id": "Alumnus_B", "title": "Live Post"},
        {"id": "2", "status": "pending", "author_id": "Alumnus_A", "title": "Author's Draft"}
    ]
    
    mock_query = MagicMock()
    mock_query.or_.return_value.order.return_value.execute.return_value = MagicMock(data=mock_data)
    mock_supabase.table.return_value.select.return_value = mock_query

    # Request as Alumnus_A
    response = client.get('/api/discussion/all?user_id=Alumnus_A')

    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['posts']) == 2
    
    # Verify the correct OR filter was applied for visibility security
    mock_query.or_.assert_called_with("status.eq.approved,author_id.eq.Alumnus_A")

def test_public_visibility_no_user(client, mocker):
    """
    Case: GET /api/discussion/all (No user_id)
    Expected: Returns only approved posts.
    """
    mock_supabase = mocker.patch('routes.discussion_routes.supabase')
    mock_query = MagicMock()
    mock_query.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
    mock_supabase.table.return_value.select.return_value = mock_query

    response = client.get('/api/discussion/all')

    assert response.status_code == 200
    # Verify the query strictly filtered by approved only
    mock_query.eq.assert_called_with('status', 'approved')
