import json
import pytest
from unittest.mock import MagicMock

def setup_mock_supabase(mocker, route_path):
    mock_supabase = mocker.patch(f'{route_path}.supabase')
    mock_query = MagicMock()
    mock_supabase.table.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.in_.return_value = mock_query
    mock_query.delete.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.update.return_value = mock_query
    mock_query.order.return_value = mock_query
    
    # RPC mock
    mock_supabase.rpc.return_value = mock_query
    
    return mock_supabase, mock_query

def test_admin_add_resource(client, mocker):
    """Test Case: Admin successfully adds a new verified resource."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.admin_routes')
    
    mock_query.execute.return_value = MagicMock(data=[{"resource_id": 123, "title": "New Resource"}])
    
    payload = {"title": "New Resource", "url": "http://test.com", "concept_tag": "Python"}
    response = client.post('/api/admin/resources/add', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['resource']['resource_id'] == 123
    mock_supabase.table.assert_called_with('verified_resources')
    mock_query.insert.assert_called_with(payload)

def test_admin_delete_resource(client, mocker):
    """Test Case: Admin deletes a resource."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.admin_routes')
    
    mock_query.execute.return_value = MagicMock()
    
    response = client.delete('/api/admin/resources/delete/123')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    mock_query.delete.assert_called()
    mock_query.eq.assert_called_with('resource_id', 123)

def test_add_manual_skill(client, mocker):
    """Test Case: Admin adds a skill to a roadmap (shifts others up)."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.admin_routes')
    
    # Skill insert returns the new skill_id
    mock_query.execute.side_effect = [
        MagicMock(), # RPC shift_roadmap_steps_up
        MagicMock(data=[{"skill_id": 500}]), # Skill insert
        MagicMock() # Roadmap step insert
    ]
    
    payload = {
        "career_id": 1,
        "step_order": 2,
        "skill_name": "Testing Skill",
        "description": "Desc",
        "concept_tag": "test-tag"
    }
    response = client.post('/api/admin/career/add-skill', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['skill_id'] == 500
    
    # Verify RPC was called to make room
    mock_supabase.rpc.assert_called_with('shift_roadmap_steps_up', {'p_career_id': 1, 'p_start_step': 2})
    
    # Verify skill was inserted
    mock_supabase.table.assert_any_call('skill')
    
    # Verify roadmap_step was inserted at the correct slot
    mock_supabase.table.assert_any_call('roadmap_step')
    mock_query.insert.assert_any_call({"career_id": 1, "skill_id": 500, "step_order": 2})

def test_delete_roadmap_skill(client, mocker):
    """Test Case: Admin removes a skill from roadmap (shifts others down)."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.admin_routes')
    
    mock_query.execute.return_value = MagicMock()
    
    response = client.delete('/api/admin/career/delete-skill?career_id=1&skill_id=500&step_order=2')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify cascade deletes
    mock_supabase.table.assert_any_call('learning_resource')
    mock_supabase.table.assert_any_call('quiz')
    mock_supabase.table.assert_any_call('roadmap_step')
    mock_supabase.table.assert_any_call('skill')
    
    # Verify RPC shift down
    mock_supabase.rpc.assert_called_with('shift_roadmap_steps_down', {'p_career_id': 1, 'p_start_step': 2})

def test_reorder_skill_up(client, mocker):
    """Test Case: Admin moves a skill UP in the roadmap."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.admin_routes')
    
    mock_query.execute.return_value = MagicMock()
    
    payload = {
        "career_id": 1,
        "skill_id": 500,
        "direction": "up",
        "step_order": 3
    }
    response = client.post('/api/admin/career/reorder-skill', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify swap logic:
    # 1. Other skill to 999
    # 2. This skill to new_order (2)
    # 3. Other skill to current_order (3)
    
    # The new_order should be 3 - 1 = 2
    mock_query.update.assert_any_call({"step_order": 2})
    mock_query.update.assert_any_call({"step_order": 3}) # Swapping back from 999
    
    # Verify normalization RPC
    mock_supabase.rpc.assert_called_with('normalize_roadmap', {'p_career_id': 1})
