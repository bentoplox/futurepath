from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

quality_bp = Blueprint('quality', __name__)

@quality_bp.route('/api/quality/curriculum-tree', methods=['GET'])
def get_curriculum_tree():
    """Builds a nested tree of Careers -> Skills -> Resources for the Alumni Curriculum Review"""
    try:
        careers_res = supabase.table('career').select('*').execute()
        careers = careers_res.data
        
        roadmap_res = supabase.table('roadmap_step').select('*, skill(*)').order('step_order').execute()
        roadmap_steps = roadmap_res.data
        
        # ⚡ REFACTOR: Fetch from verified_resources instead of learning_resource
        resources_res = supabase.table('verified_resources').select('*').execute()
        resources = resources_res.data
        
        tree = []
        for c in careers:
            career_node = {
                "id": c['career_id'],
                "name": c['career_name'],
                "type": "career_path",
                "skills": []
            }
            
            c_steps = [r for r in roadmap_steps if r['career_id'] == c['career_id']]
            for step in c_steps:
                s = step.get('skill')
                if not s: continue
                
                skill_node = {
                    "id": s['skill_id'],
                    "name": s['skill_name'],
                    "type": "skill",
                    "resources": []
                }
                
                # ⚡ REFACTOR: Map resources using the shared 'concept_tag'
                s_resources = [res for res in resources if res.get('concept_tag') and res['concept_tag'] == s.get('concept_tag')]
                for r in s_resources:
                    skill_node["resources"].append({
                        "id": r['resource_id'],
                        "name": r['title'],
                        "url": r['url'],
                        "provider": r['provider'],
                        "type": "verified_resource"
                    })
                
                career_node["skills"].append(skill_node)
            
            tree.append(career_node)
            
        return jsonify({"success": True, "tree": tree})
    except Exception as e:
        print(f"[ERROR] Fetching curriculum tree failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@quality_bp.route('/api/quality/feedback', methods=['POST'])
def submit_feedback():
    """Captures crowdsourced QA and Industry Suggestions from Students & Alumni"""
    data = request.json
    try:
        payload = {
            "user_id": data['user_id'],
            "user_role": data['user_role'],
            "target_type": data['target_type'],
            "target_id": data.get('target_id'),
            "target_name": data.get('target_name'),
            "feedback_type": data['feedback_type'],
            "suggested_alternative_text": data.get('suggested_alternative_text'),
            "status": "pending"
        }
        
        res = supabase.table('content_feedback').insert(payload).execute()
        return jsonify({"success": True, "feedback": res.data[0]}), 201
    except Exception as e:
        print(f"[ERROR] Submitting feedback: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@quality_bp.route('/api/admin/quality-control', methods=['GET'])
def get_quality_control_dashboard():
    """Fetches and splits feedback into Alumni Insights and Student QA Reports"""
    try:
        # Fetch pending feedback and join with users table to get the submitter's name
        res = supabase.table('content_feedback')\
            .select('*, users(name)')\
            .eq('status', 'pending')\
            .order('created_at', desc=True)\
            .execute()
            
        all_feedback = res.data

        # ⚡ ARCHITECTURAL SPLIT: Separate arrays for the Dual-Grid Admin UI
        alumni_insights = []
        student_reports = []

        for item in all_feedback:
            # Clean up the author name mapping
            item['author_name'] = item.get('users', {}).get('name', 'Anonymous')
            
            if item['user_role'] == 'alumni':
                alumni_insights.append(item)
            elif item['user_role'] == 'student':
                student_reports.append(item)

        return jsonify({
            "success": True, 
            "data": {
                "alumni_insights": alumni_insights,
                "student_reports": student_reports
            }
        })
    except Exception as e:
        print(f"[ERROR] Fetching quality control data: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@quality_bp.route('/api/admin/summary-stats', methods=['GET'])
def get_admin_summary_stats():
    """Calculates aggregate metrics for the Dashboard Overview scorecard"""
    try:
        # 1. User counts by role
        s_res = supabase.table('users').select('*', count='exact', head=True).eq('role', 'student').execute()
        a_res = supabase.table('users').select('*', count='exact', head=True).eq('role', 'alumni').execute()
        
        # 2. Pending alumni posts
        p_res = supabase.table('alumni_posts').select('*', count='exact', head=True).eq('status', 'pending').execute()
        
        # 3. Unread feedback (Alumni Insights)
        fa_res = supabase.table('content_feedback').select('*', count='exact', head=True).eq('status', 'pending').eq('user_role', 'alumni').execute()
        
        # 4. Unread feedback (Student Reports)
        fs_res = supabase.table('content_feedback').select('*', count='exact', head=True).eq('status', 'pending').eq('user_role', 'student').execute()
        
        return jsonify({
            "success": True,
            "stats": {
                "total_students": s_res.count or 0,
                "verified_alumni": a_res.count or 0,
                "pending_moderation": p_res.count or 0,
                "unread_alumni_insights": fa_res.count or 0,
                "unread_student_reports": fs_res.count or 0
            }
        })
    except Exception as e:
        print(f"[ERROR] Fetching summary stats: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@quality_bp.route('/api/admin/mark-feedback-reviewed', methods=['POST'])
def mark_all_feedback_reviewed():
    """Bulk updates all pending feedback to 'reviewed' status"""
    try:
        supabase.table('content_feedback').update({"status": "reviewed"}).eq('status', 'pending').execute()
        return jsonify({"success": True, "message": "All pending feedback marked as reviewed"})
    except Exception as e:
        print(f"[ERROR] Marking feedback reviewed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@quality_bp.route('/api/admin/quality-control/resolve/<int:feedback_id>', methods=['POST'])
def resolve_feedback(feedback_id):
    """Allows Admins to mark feedback as reviewed/implemented"""
    action = request.json.get('action', 'reviewed') # 'implemented' or 'dismissed'
    try:
        supabase.table('content_feedback').update({"status": action}).eq('feedback_id', feedback_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
