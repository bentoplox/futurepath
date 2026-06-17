import json

def test_get_career_roadmap_not_found(client, mocker):
    """Test Case 1: Ensure an invalid career ID safely returns a 404 Error."""
    
    # ⚡ FIX: Patch the instance imported INSIDE the routes file, not the source file!
    mock_supabase = mocker.patch('routes.student_routes.supabase')
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    response = client.get('/api/roadmap/999')
    data = json.loads(response.data)

    assert response.status_code == 404
    assert data['success'] is False


def test_submit_quiz_graded_capstone(client, mocker):
    """Test Case 2: Ensure scoring >= 66% on a capstone marks the roadmap as 'completed'."""
    
    # ⚡ FIX: Patch the instance imported INSIDE the routes file
    mock_supabase = mocker.patch('routes.student_routes.supabase')
    
    mock_supabase.table.return_value.select.return_value.in_.return_value.execute.return_value.data = [
        {'quiz_id': 1, 'skill_id': 100},
        {'quiz_id': 2, 'skill_id': 100}
    ]
    
    payload = {
        "student_id": "test-uuid-123",
        "career_id": 1,
        "total_score": 85,  
        "answers": [
            {"question_id": 1, "is_correct": True},
            {"question_id": 2, "is_correct": True}
        ]
    }

    response = client.post('/api/submit-quiz', json=payload)
    data = json.loads(response.data)

    # If it fails, this print statement will show you EXACTLY why in the terminal!
    if response.status_code == 500:
        print("\n🔥 BACKEND CRASH REASON:", data.get('error'))

    assert response.status_code == 201
    assert data['success'] is True
    
    # Verify the backend actually sent the database command to update the status!
    mock_supabase.table.assert_any_call('roadmap')
    mock_supabase.table().update.assert_called_with({"status": "completed"})