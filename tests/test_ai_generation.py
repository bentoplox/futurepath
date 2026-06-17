import json
import pytest
from unittest.mock import MagicMock, patch

def setup_mock_supabase(mocker, route_path):
    mock_supabase = mocker.patch(f'{route_path}.supabase')
    mock_query = MagicMock()
    mock_supabase.table.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[])
    return mock_supabase, mock_query

@patch('routes.ai_routes.get_ai_response')
@patch('routes.ai_routes.clean_json')
def test_draft_steps(mock_clean, mock_ai, client, mocker):
    """Test Case: Drafting roadmap steps using AI."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.ai_routes')
    
    # Mock verified tags
    mock_query.execute.return_value = MagicMock(data=[{"concept_tag": "python"}, {"concept_tag": "react"}])
    
    # Mock AI response
    mock_ai.return_value = "RAW AI RESPONSE"
    mock_clean.return_value = json.dumps({
        "description": "A great role",
        "steps": [
            {"skill_name": "Python", "concept_tag": "python", "category": "Technical", "description": "Learn it"}
        ]
    })
    
    response = client.post('/api/admin/draft/steps', json={"career_name": "Data Scientist"})
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['draft']['steps'][0]['skill_name'] == "Python"
    mock_ai.assert_called_once()

@patch('routes.ai_routes.get_ai_response')
@patch('routes.ai_routes.clean_json')
def test_draft_quizzes(mock_clean, mock_ai, client, mocker):
    """Test Case: Drafting quizzes using AI."""
    # Mock AI response
    mock_ai.return_value = "RAW AI QUIZ"
    mock_clean.return_value = json.dumps({
        "quizzes": [
            {
                "skill_name": "Python",
                "questions": [
                    {"question": "Q1", "options": ["A", "B"], "correct_answer": "A", "difficulty": "Beginner"}
                ]
            }
        ]
    })
    
    response = client.post('/api/admin/draft/quizzes', json={"skills": ["Python"]})
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['draft']['quizzes'][0]['skill_name'] == "Python"

def test_commit_pathway(client, mocker):
    """Test Case: Committing a drafted pathway to the database."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.ai_routes')
    
    # Sequence of returns for multiple inserts:
    # 1. Career insert -> c_id=10
    # 2. Skill insert -> s_id=100
    # 3. Roadmap step insert
    # 4. Quiz insert
    mock_query.execute.side_effect = [
        MagicMock(data=[{"career_id": 10}]), # Career
        MagicMock(data=[{"skill_id": 100}]), # Skill
        MagicMock(), # Roadmap step
        MagicMock() # Quiz
    ]
    
    payload = {
        "career_name": "AI Engineer",
        "description": "Build AI",
        "steps": [
            {"skill_name": "ML", "category": "Technical", "description": "Machine Learning", "concept_tag": "ml"}
        ],
        "quizzes": [
            {
                "skill_name": "ML",
                "questions": [{"question": "Q1", "options": ["A", "B"], "correct_answer": "A"}]
            }
        ]
    }
    
    response = client.post('/api/admin/commit-pathway', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify career was created
    mock_supabase.table.assert_any_call('career')
    mock_query.insert.assert_any_call({"career_name": "AI Engineer", "description": "Build AI", "status": "draft"})
    
    # Verify skill was created
    mock_supabase.table.assert_any_call('skill')
    
    # Verify roadmap step linked
    mock_supabase.table.assert_any_call('roadmap_step')
    mock_query.insert.assert_any_call({"career_id": 10, "skill_id": 100, "step_order": 1})
