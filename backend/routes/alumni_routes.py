from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

alumni_bp = Blueprint('alumni', __name__)

@alumni_bp.route('/api/alumni/profile/stats', methods=['GET'])
def get_alumni_stats():
    user_id = request.args.get('user_id')
    try:
        res = supabase.table('alumni_career_stats').select('*').eq('user_id', user_id).maybeSingle().execute()
        return jsonify({"success": True, "stats": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@alumni_bp.route('/api/alumni/profile/stats', methods=['POST'])
def update_alumni_stats():
    data = request.json
    try:
        payload = {
            "user_id": data['user_id'],
            "salary": data.get('salary'),
            "years_xp": data.get('years_xp'),
            "employer_name": data.get('employer_name'),
            "job_title": data.get('job_title'),
            "location": data.get('location'),
            "is_public": data.get('is_public', True),
            "updated_at": "now()"
        }
        res = supabase.table('alumni_career_stats').upsert(payload).execute()
        return jsonify({"success": True, "stats": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@alumni_bp.route('/api/market/insights', methods=['GET'])
def get_market_insights():
    """Aggregates real alumni data for the Employability Dashboard"""
    try:
        # 1. Top Hiring Employers
        # We fetch all and aggregate in Python for flexibility
        res = supabase.table('alumni_career_stats').select('employer_name, job_title, salary').eq('is_public', True).execute()
        data = res.data

        # Aggregation Logic
        employers = {}
        roles = {}
        salary_by_xp = {"0-2": [], "3-5": [], "5+": []}

        for entry in data:
            emp = entry.get('employer_name')
            role = entry.get('job_title')
            sal = entry.get('salary')

            if emp: employers[emp] = employers.get(emp, 0) + 1
            if role: roles[role] = roles.get(role, 0) + 1

        # Sort and take top 5
        top_employers = sorted([{"name": k, "value": v} for k, v in employers.items()], key=lambda x: x['value'], reverse=True)[:5]
        top_roles = sorted([{"name": k, "count": v} for k, v in roles.items()], key=lambda x: x['count'], reverse=True)[:5]

        return jsonify({
            "success": True,
            "top_employers": top_employers,
            "top_roles": top_roles
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
