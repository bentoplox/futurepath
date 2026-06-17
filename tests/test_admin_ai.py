import pytest
import json
from unittest.mock import MagicMock, patch

# ============================================================================
# 1. HELPER: Mock Supabase Response Object
# ============================================================================
class MockResponse:
    def __init__(self, data, count=0):
        self.data = data
        self.count = count

# ============================================================================
# 2. TEST SUITE: AI ADVISOR & HEATMAP ANALYTICS
# ============================================================================

def test_ai_advisor_data_compression(client, mocker):
    """
    Case: 50 failing quiz records for the same skill.
    Expected: Backend aggregates them into a single summary object for the AI prompt.
    """
    # 1. Mock Supabase responses
    mock_supabase = mocker.patch('routes.workshop_routes.supabase')
    
    # Simulate 50 failing records for "Python"
    failing_records = [{"score": 40, "skill_id": 1, "skill": {"skill_name": "Python", "skill_category": "Technical"}}] * 50
    
    mock_quiz_chain = MagicMock()
    mock_quiz_chain.select.return_value.lt.return_value.execute.return_value = MockResponse(failing_records)
    
    mock_empty_chain = MagicMock()
    mock_empty_chain.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MockResponse([])
    mock_empty_chain.select.return_value.execute.return_value = MockResponse([])
    
    def table_side_effect(table_name):
        if table_name == 'quiz_result': return mock_quiz_chain
        return mock_empty_chain

    mock_supabase.table.side_effect = table_side_effect

    # 2. Mock the AI Service
    mock_ai = mocker.patch('routes.workshop_routes.get_ai_response')
    mock_ai.return_value = json.dumps([{"title": "Test Workshop", "target_track": "AI", "justification": "Low", "agenda": ["A"], "urgency_level": "High"}])

    # 3. Call endpoint
    response = client.get('/api/admin/ai-workshop-recommendations')
    
    # 4. Verify Compression
    assert mock_ai.called
    prompt_sent = mock_ai.call_args[0][0]
    
    assert '"skill":"Python"' in prompt_sent
    assert '"count":50' in prompt_sent
    assert '"avg":40.0' in prompt_sent
    
    data = json.loads(response.data)
    assert data['success'] is True

def test_heatmap_aggregation_math(client, mocker):
    """
    Case: 3 attempts for Year 1 (100%, 50%, 0%).
    Expected: Average = 50%, Count = 3.
    """
    # 1. Mock Supabase
    mock_supabase = mocker.patch('routes.admin_routes.supabase')
    
    links_data = [
        {"skill_id": 1, "skill": {"skill_name": "Calculus"}, "career": {"career_id": 10, "career_name": "AI", "status": "published"}}
    ]
    results_data = [
        {"score": 100, "skill_id": 1, "users": {"academic_year": "Year 1"}},
        {"score": 50, "skill_id": 1, "users": {"academic_year": "Year 1"}},
        {"score": 0, "skill_id": 1, "users": {"academic_year": "Year 1"}}
    ]
    
    mock_links_chain = MagicMock()
    mock_links_chain.select.return_value.execute.return_value = MockResponse(links_data)
    
    mock_results_chain = MagicMock()
    mock_results_chain.select.return_value.execute.return_value = MockResponse(results_data)

    def table_side_effect(table_name):
        if table_name == 'roadmap_step': return mock_links_chain
        if table_name == 'quiz_result': return mock_results_chain
        return MagicMock()

    mock_supabase.table.side_effect = table_side_effect

    # 2. Call endpoint
    response = client.get('/api/admin/heatmap')
    
    # 3. Verify Math
    data = json.loads(response.data)
    assert data['success'] is True
    assert len(data['heatmap']) > 0
    
    row = data['heatmap'][0]
    assert row['y1'] == 50
    assert row['y1_count'] == 3
