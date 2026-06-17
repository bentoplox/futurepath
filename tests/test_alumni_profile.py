import json
import pytest
from unittest.mock import MagicMock

def setup_mock_supabase(mocker, route_path):
    mock_supabase = mocker.patch(f'{route_path}.supabase')
    mock_query = MagicMock()
    mock_supabase.table.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.upsert.return_value = mock_query
    mock_query.update.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[])
    return mock_supabase, mock_query

def test_get_alumni_stats_existing(client, mocker):
    """Test Case: Fetching existing alumni profile stats."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.alumni_routes')
    
    mock_data = [{
        "user_id": "alumni123",
        "salary": 5000,
        "employer_name": "Tech Corp",
        "users": {
            "name": "John Doe",
            "programme": "Data Science",
            "show_workplace": True,
            "current_role": "Engineer"
        }
    }]
    mock_query.execute.return_value = MagicMock(data=mock_data)
    
    response = client.get('/api/alumni/profile/stats?user_id=alumni123')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['stats']['salary'] == 5000
    assert data['stats']['users']['name'] == "John Doe"

def test_get_alumni_stats_fallback(client, mocker):
    """Test Case: Fetching alumni profile stats for new user (fallback to users table)."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.alumni_routes')
    
    # First call (stats table) returns empty, second call (users table) returns data
    mock_query.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[{"name": "New Alumni", "programme": "CS", "show_workplace": False, "current_role": ""}])
    ]
    
    response = client.get('/api/alumni/profile/stats?user_id=newalumni')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['stats'] is None
    assert data['name'] == "New Alumni"

def test_update_alumni_stats(client, mocker):
    """Test Case: Updating alumni profile and user identity."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.alumni_routes')
    
    mock_query.execute.return_value = MagicMock()
    
    payload = {
        "user_id": "alumni123",
        "salary": 6000,
        "employer_name": "New Company",
        "name": "John Updated",
        "current_role": "Senior Engineer"
    }
    response = client.post('/api/alumni/profile/stats', json=payload)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    
    # Verify upsert to career stats
    mock_supabase.table.assert_any_call('alumni_career_stats')
    mock_query.upsert.assert_called()
    
    # Verify update to users table
    mock_supabase.table.assert_any_call('users')
    mock_query.update.assert_called_with({
        "name": "John Updated",
        "current_role": "Senior Engineer"
    })

def test_get_market_stats(client, mocker):
    """Test Case: Fetching graduate statistics for a specific year."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.alumni_routes')
    
    mock_query.execute.return_value = MagicMock(data=[{"year": 2026, "employment_rate": 95}])
    
    response = client.get('/api/market/stats?year=2026')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data['success'] is True
    assert data['stats'][0]['employment_rate'] == 95
    mock_query.eq.assert_called_with('year', '2026')

def test_market_insights_aggregation(client, mocker):
    """Test Case: Verify complex aggregation logic for market insights."""
    mock_supabase, mock_query = setup_mock_supabase(mocker, 'routes.alumni_routes')
    
    mock_alumni_data = [
        {
            "employer_name": "Google",
            "job_title": "AI Engineer",
            "salary": 8000,
            "internship_company": "Startup X",
            "internship_role": "Dev Intern",
            "users": {"programme": "Artificial Intelligence"}
        },
        {
            "employer_name": "Google",
            "job_title": "Data Scientist",
            "salary": 7000,
            "internship_company": "Startup X",
            "internship_role": "Data Intern",
            "users": {"programme": "Artificial Intelligence"}
        }
    ]
    mock_query.execute.return_value = MagicMock(data=mock_alumni_data)
    
    response = client.get('/api/market/insights')
    data = json.loads(response.data)
    
    assert data['success'] is True
    ai_insights = data['insights']['ARTIFICIAL INTELLIGENCE']
    
    # Check Top Employers
    google_stat = next(e for e in ai_insights['top_employers'] if e['name'] == 'Google')
    assert google_stat['count'] == 2
    assert google_stat['avg_salary'] == 7500 # (8000 + 7000) / 2
    
    # Check Top Internships
    startup_stat = next(e for e in ai_insights['top_internships'] if e['name'] == 'Startup X')
    assert startup_stat['count'] == 2
    
    # Check Overall Faculty
    faculty_insights = data['insights']['OVERALL FACULTY (FSKTM)']
    assert faculty_insights['top_employers'][0]['name'] == 'Google'
    assert faculty_insights['top_employers'][0]['count'] == 2
