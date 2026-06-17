import json
import pytest
from unittest.mock import MagicMock

def setup_mock_supabase(mocker, route_path):
    mock_supabase = mocker.patch(f'{route_path}.supabase')
    
    # Mocking the chain: table().select().eq().eq().execute()
    # We'll use a side_effect on execute or table to distinguish
    
    mock_query = MagicMock()
    mock_supabase.table.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.in_.return_value = mock_query
    mock_query.delete.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.update.return_value = mock_query
    
    return mock_supabase, mock_query

def test_quiz_vote_new(client, mocker):
    """Test Case: Upvoting a quiz for the first time."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.quiz_routes')
    
    # Define what execute() returns based on the context
    def mock_execute():
        # Look at the most recent table call
        table_name = mock_supabase.table.call_args[0][0]
        if table_name == 'student_quiz_votes':
            return MagicMock(data=[]) # No existing vote
        if table_name == 'quiz':
            # This is the select for counts or the final update
            return MagicMock(data=[{"upvotes": 5, "downvotes": 2}])
        return MagicMock(data=[])

    mock_query.execute.side_effect = mock_execute
    
    payload = {"user_id": "user123", "quiz_id": 1, "vote_type": "upvote"}
    response = client.post('/api/quiz/vote', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['upvotes'] == 6
    assert mock_query.insert.called

def test_quiz_vote_toggle_off(client, mocker):
    """Test Case: Clicking upvote again should remove the vote."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.quiz_routes')
    
    def mock_execute():
        table_name = mock_supabase.table.call_args[0][0]
        if table_name == 'student_quiz_votes':
            # If it's a select, return existing vote. If delete, just return.
            return MagicMock(data=[{"vote_type": "upvote", "user_id": "user123", "quiz_id": 1}])
        if table_name == 'quiz':
            return MagicMock(data=[{"upvotes": 10, "downvotes": 1}])
        return MagicMock(data=[])

    mock_query.execute.side_effect = mock_execute
    
    payload = {"user_id": "user123", "quiz_id": 1, "vote_type": "upvote"}
    response = client.post('/api/quiz/vote', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['upvotes'] == 9
    assert mock_query.delete.called

def test_submit_quiz_failing_grade(client, mocker):
    """Test Case: Scoring < 66% should NOT complete the roadmap."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.student_routes')
    
    mock_query.execute.return_value = MagicMock(data=[
        {'quiz_id': 1, 'skill_id': 100}
    ])
    
    payload = {
        "student_id": "student123",
        "career_id": 1,
        "total_score": 40,
        "answers": [{"question_id": 1, "is_correct": False}]
    }
    
    response = client.post('/api/submit-quiz', json=payload)
    assert response.status_code == 201
    
    # Check that roadmap was never updated to 'completed'
    # We filter calls to table('roadmap') and see if update() followed
    roadmap_update_called = False
    for i, call in enumerate(mock_supabase.table.call_args_list):
        if call[0][0] == 'roadmap':
            # Check if the next calls on mock_query were update({"status": "completed"})
            # This is hard to track perfectly with this simple mock, but we can check if update was EVER called with that
            pass
            
    # Simpler: check if update was called with status: completed
    for call in mock_query.update.call_args_list:
        if call[0][0].get('status') == 'completed':
            roadmap_update_called = True
    
    assert roadmap_update_called is False

def test_submit_quiz_multiple_skills(client, mocker):
    """Test Case: Quiz results calculated correctly across different skills."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.student_routes')
    
    mock_query.execute.return_value = MagicMock(data=[
        {'quiz_id': 1, 'skill_id': 'Skill_A'},
        {'quiz_id': 2, 'skill_id': 'Skill_B'}
    ])
    
    payload = {
        "student_id": "student123",
        "answers": [
            {"question_id": 1, "is_correct": True}, 
            {"question_id": 2, "is_correct": False}
        ]
    }
    
    response = client.post('/api/submit-quiz', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 201
    results = data['results']
    
    a_result = next(r for r in results if r['skill_id'] == 'Skill_A')
    b_result = next(r for r in results if r['skill_id'] == 'Skill_B')
    
    assert a_result['score'] == 100
    assert b_result['score'] == 0
