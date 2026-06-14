from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

alumni_bp = Blueprint('alumni', __name__)

@alumni_bp.route('/api/alumni/profile/stats', methods=['GET'])
def get_alumni_stats():
    user_id = request.args.get('user_id')
    try:
        # Fetch analytics stats along with current User display profile settings
        res = supabase.table('alumni_career_stats').select('*, users(name, programme, show_workplace, current_role)').eq('user_id', user_id).execute()
        
        # Fallback profile setup if historical entry stats don't exist yet
        if not res.data or len(res.data) == 0:
            user_res = supabase.table('users').select('name, programme, show_workplace, current_role').eq('user_id', user_id).execute()
            has_user = user_res.data and len(user_res.data) > 0
            
            return jsonify({
                "success": True, 
                "stats": None, 
                "name": user_res.data[0].get('name') if has_user else None,
                "programme": user_res.data[0].get('programme') if has_user else None,
                "show_workplace": user_res.data[0].get('show_workplace') if has_user else False,
                "current_role": user_res.data[0].get('current_role') if has_user else ''
            })
            
        return jsonify({"success": True, "stats": res.data[0]})
        
    except Exception as e:
        print(f"[ERROR] Profile load failure: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@alumni_bp.route('/api/alumni/profile/stats', methods=['POST'])
def update_alumni_stats():
    data = request.json
    try:
        # 1. Sync historical data into Career Stats tracking table
        payload = {
            "user_id": data['user_id'],
            "salary": data.get('salary'),
            "years_xp": data.get('years_xp'),
            "employer_name": data.get('employer_name'),
            "job_title": data.get('job_title'),
            "internship_company": data.get('internship_company'),
            "is_public": True,
            "updated_at": "now()"
        }
        supabase.table('alumni_career_stats').upsert(payload).execute()
        
        # 2. Sync Identity presentation data inside the Users table
        user_update = {}
        if data.get('programme'): user_update["programme"] = data['programme']
        if data.get('name'): user_update["name"] = data['name']
        if 'show_workplace' in data: user_update["show_workplace"] = data['show_workplace']
        if 'current_role' in data: user_update["current_role"] = data['current_role']
        
        if user_update:
            supabase.table('users').update(user_update).eq('user_id', data['user_id']).execute()
            
        return jsonify({"success": True, "message": "Profile successfully updated!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@alumni_bp.route('/api/market/stats', methods=['GET'])
def get_graduate_stats():
    year = request.args.get('year', 2025)
    try:
        res = supabase.table('faculty_ge_data').select('*').eq('year', year).execute()
        return jsonify({"success": True, "stats": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@alumni_bp.route('/api/market/insights', methods=['GET'])
def get_market_insights():
    """Aggregates real early-career alumni data (<=3 years), segmented by Programme"""
    try:
        # Join with users to get their 'programme' (Department)
        res = supabase.table('alumni_career_stats').select('*, users(programme)').eq('is_public', True).execute()
        raw_data = res.data

        # ⚡ FILTER: Only use Early Career Data (0-3 years) for accurate entry metrics
        early_career_data = [d for d in raw_data if d.get('years_xp') is not None and d['years_xp'] <= 3]

        # ⚡ UPDATED: Initializing the explicit English master bucket
        program_insights = {
            "OVERALL FACULTY (FSKTM)": {"employers": {}, "internships": {}, "roles": {}}
        }

        for entry in early_career_data:
            raw_prog = entry.get('users', {}).get('programme', 'General')
            prog = raw_prog.upper() if raw_prog else 'GENERAL'
            
            if prog not in program_insights:
                program_insights[prog] = {"employers": {}, "internships": {}, "roles": {}}
            
            emp = entry.get('employer_name')
            intern = entry.get('internship_company')
            role = entry.get('job_title')
            sal = entry.get('salary')

            # Helper function to inject data into a specific bucket
            def add_to_bucket(target):
                if emp:
                    if emp not in target["employers"]: target["employers"][emp] = {"count": 0, "total_sal": 0}
                    target["employers"][emp]["count"] += 1
                    if sal: target["employers"][emp]["total_sal"] += float(sal)

                if intern:
                    target["internships"][intern] = target["internships"].get(intern, 0) + 1

                if role:
                    if role not in target["roles"]: target["roles"][role] = {"count": 0, "total_sal": 0}
                    target["roles"][role]["count"] += 1
                    if sal: target["roles"][role]["total_sal"] += float(sal)

            # 1. Add metrics to the specific undergraduate department array
            add_to_bucket(program_insights[prog])
            
            # 2. Simultaneously add metrics to the combined English master bucket
            add_to_bucket(program_insights["OVERALL FACULTY (FSKTM)"])

        # ⚡ FORMAT FINAL RESPONSE
        formatted_insights = {}
        for p, data in program_insights.items():
            top_employers = sorted([
                {"name": k, "count": v["count"], "avg_salary": round(v["total_sal"]/v["count"]) if v["count"] > 0 else 0} 
                for k, v in data["employers"].items()
            ], key=lambda x: x['count'], reverse=True)[:5]

            top_roles = sorted([
                {"name": k, "count": v["count"], "avg_salary": round(v["total_sal"]/v["count"]) if v["count"] > 0 else 0} 
                for k, v in data["roles"].items()
            ], key=lambda x: x['count'], reverse=True)[:5]

            top_internships = sorted([
                {"name": k, "count": v} 
                for k, v in data["internships"].items()
            ], key=lambda x: x['count'], reverse=True)[:5]

            formatted_insights[p] = {
                "top_employers": top_employers,
                "top_roles": top_roles,
                "top_internships": top_internships
            }

        return jsonify({
            "success": True,
            "insights": formatted_insights
        })
    except Exception as e:
        print(f"[ERROR] Market Insights failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500