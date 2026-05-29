# ============================================================================
# FILE: backend/app.py
# PURPOSE: High-Speed User API & Admin Background Triggers
# ============================================================================

import sys
import threading
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

# 🔥 WINDOWS CRASH FIX: Forces the terminal to accept all characters/emojis
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app) 

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
# ⚡ UPDATED: Using Service Role Key to bypass RLS and ensure data persistence
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/api/admin/sync', methods=['POST'])
def admin_sync_content():
    try:
        print("[ADMIN] Requested AI Database Generation.")
        
        def run_background_script():
            print(f"[WORKER] Starting background_generator.py using {sys.executable}...")
            try:
                # By NOT capturing output, it streams directly to the Flask terminal in real-time
                subprocess.run(
                    [sys.executable, "background_generator.py"], 
                    check=True
                )
                print("[WORKER] Script finished successfully.")
            except subprocess.CalledProcessError as e:
                print(f"[WORKER] Script failed. Check logs above.")
            except Exception as e:
                print(f"[WORKER] Unexpected error: {str(e)}")

        thread = threading.Thread(target=run_background_script)
        thread.start()
        
        return jsonify({
            "success": True, 
            "message": "AI Generation started in the background! Check your python terminal."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/careers', methods=['GET'])
def get_all_careers():
    try:
        res = supabase.table('career').select('*').execute()
        return jsonify({"success": True, "careers": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/enroll', methods=['POST'])
def enroll_user():
    data = request.json
    user_id = data.get('user_id')
    career_id = data.get('career_id')
    print(f"[API] Enrolling user {user_id} in career {career_id}")
    try:
        existing = supabase.table('roadmap').select('*').eq('user_id', user_id).eq('career_id', career_id).execute()
        if not existing.data:
            supabase.table('roadmap').insert({"user_id": user_id, "career_id": career_id, "status": "active"}).execute()
            print(f"[SUCCESS] Enrollment created for {user_id}")
        else:
            print(f"[INFO] User {user_id} already enrolled in {career_id}")
        return jsonify({"success": True})
    except Exception as e:
        print(f"[ERROR] Enrollment failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/roadmap/<int:career_id>', methods=['GET'])
def get_career_roadmap(career_id):
    user_id = request.args.get('user_id')
    try:
        career_res = supabase.table('career').select('*').eq('career_id', career_id).single().execute()
        steps_res = supabase.table('roadmap_step')\
            .select('step_id, step_order, skill(skill_id, skill_name, description, learning_resource(resource_id, title, provider, url, cost_type))')\
            .eq('career_id', career_id)\
            .order('step_order')\
            .execute()

        # Fetch user progress if user_id is provided
        completed_steps = []
        is_eligible_for_quiz = False
        is_certified = False

        if user_id:
            # 1. Get user's completed steps
            progress_res = supabase.table('progress_record')\
                .select('step_id')\
                .eq('user_id', user_id)\
                .eq('completion_status', 'completed')\
                .execute()
            completed_steps = [p['step_id'] for p in progress_res.data]

            # 2. Get roadmap status
            roadmap_res = supabase.table('roadmap')\
                .select('status')\
                .eq('user_id', user_id)\
                .eq('career_id', career_id)\
                .execute()
            
            roadmap_status = roadmap_res.data[0]['status'] if roadmap_res.data else 'active'
            is_certified = (roadmap_status == 'completed')

            # 3. Calculate Eligibility
            # Count steps for this career
            total_steps_count = len(steps_res.data)
            # Count completed steps for this user in THIS specific career
            career_step_ids = [s['step_id'] for s in steps_res.data]
            user_career_completed_count = len([sid for sid in completed_steps if sid in career_step_ids])

            if user_career_completed_count == total_steps_count and not is_certified:
                is_eligible_for_quiz = True

        return jsonify({
            "success": True, 
            "career": career_res.data,
            "steps": steps_res.data,
            "completed_steps": completed_steps,
            "is_eligible_for_quiz": is_eligible_for_quiz,
            "is_certified": is_certified
        })
    except Exception as e:
        print(f"[ERROR] Fetching roadmap failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    user_id = data.get('user_id')
    career_id = data.get('career_id')
    score = data.get('score')
    
    if not all([user_id, career_id, score is not None]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    try:
        # 1. Save results (Using the first skill of the career as a placeholder since schema requires skill_id)
        # Find any skill_id associated with this career to satisfy the foreign key
        first_step = supabase.table('roadmap_step').select('skill_id').eq('career_id', career_id).limit(1).execute()
        skill_id = first_step.data[0]['skill_id'] if first_step.data else None

        supabase.table('quiz_result').insert({
            "user_id": user_id,
            "skill_id": skill_id,
            "score": score
        }).execute()

        # 2. Update roadmap status to completed if they passed (score >= 66)
        if score >= 66:
            supabase.table('roadmap').update({"status": "completed"}).eq('user_id', user_id).eq('career_id', career_id).execute()

        return jsonify({"success": True, "message": "Results saved and roadmap updated."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/quiz/<int:skill_id>', methods=['GET'])
def get_skill_quiz(skill_id):
    try:
        quiz_res = supabase.table('quiz').select('*').eq('skill_id', skill_id).execute()
        if not quiz_res.data:
            return jsonify({"success": False, "error": "No quiz available for this skill phase yet."}), 404
        return jsonify({"success": True, "questions": quiz_res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/progress', methods=['POST'])
def update_progress():
    data = request.json
    user_id = data.get('user_id')
    step_id = data.get('step_id')
    status = data.get('status', 'completed')
    
    print(f"[API] Updating progress for user {user_id}, step {step_id}, status {status}")
    
    if not user_id or not step_id:
        return jsonify({"error": "Missing required data"}), 400
        
    try:
        # 1. Clear ANY existing record for this user + step to avoid duplicates
        # This is safer since the table might not have a unique constraint
        supabase.table('progress_record')\
            .delete()\
            .eq('user_id', user_id)\
            .eq('step_id', step_id)\
            .execute()
        
        # 2. If the user checked the box, insert a fresh 'completed' record
        if status == 'completed':
            supabase.table('progress_record').insert({
                "user_id": user_id,
                "step_id": step_id,
                "completion_status": 'completed'
            }).execute()
            print(f"[SUCCESS] Progress saved: User {user_id} completed step {step_id}")
        else:
            print(f"[SUCCESS] Progress removed: User {user_id} uncompleted step {step_id}")
            
        return jsonify({"success": True, "message": "Progress updated successfully."})
    except Exception as e:
        print(f"[ERROR] Progress update failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/capstone/<int:career_id>', methods=['GET'])
def get_capstone_quiz(career_id):
    try:
        # 1. Get all skills for this career
        steps = supabase.table('roadmap_step').select('skill_id').eq('career_id', career_id).execute()
        skill_ids = [s['skill_id'] for s in steps.data]
        
        if not skill_ids:
            return jsonify({"success": False, "error": "No skills found for this career."}), 404

        # 2. Get all quizzes for these skills
        # Supabase 'in' filter: .in_('skill_id', skill_ids)
        quizzes = supabase.table('quiz').select('*').in_('skill_id', skill_ids).execute()
        
        if not quizzes.data:
            return jsonify({
                "success": False, 
                "error": "This career does not have a Capstone Exam generated yet. Please ask an Admin to run Sync."
            }), 404

        import random
        # We need exactly 20 (or as many as we have if less than 20)
        final_questions = quizzes.data
        if len(final_questions) > 20:
            final_questions = random.sample(final_questions, 20)
        
        return jsonify({
            "success": True, 
            "questions": final_questions,
            "total_available": len(quizzes.data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/user/dashboard/<user_id>', methods=['GET'])
def get_user_dashboard(user_id):
    try:
        # 1. Get all roadmaps for this user
        roadmaps_res = supabase.table('roadmap').select('*, career(*)').eq('user_id', user_id).execute()
        roadmaps = roadmaps_res.data
        
        # 2. For each roadmap, calculate detailed progress
        for rm in roadmaps:
            career_id = rm['career_id']
            # Get total steps for this career
            steps_res = supabase.table('roadmap_step').select('step_id').eq('career_id', career_id).execute()
            total_steps = len(steps_res.data)
            
            # Get completed steps for THIS user for THIS career
            step_ids = [s['step_id'] for s in steps_res.data]
            completed_res = supabase.table('progress_record')\
                .select('step_id')\
                .eq('user_id', user_id)\
                .in_('step_id', step_ids)\
                .eq('completion_status', 'completed')\
                .execute()
            completed_count = len(completed_res.data)
            
            rm['progress_percent'] = round((completed_count / total_steps * 100)) if total_steps > 0 else 0
            rm['total_steps'] = total_steps
            rm['completed_steps'] = completed_count
            
            # BUG FIX: Certification is ONLY based on database status 'completed'
            # (which is set after passing the capstone quiz)
            rm['is_certified'] = (rm['status'] == 'completed')
            rm['ready_for_exam'] = (completed_count == total_steps and rm['status'] != 'completed')

        # 3. CALCULATE TOP-LEVEL KPIs
        # KPI 1: Total Skills (unique completed steps across all roadmaps)
        total_skills_res = supabase.table('progress_record')\
            .select('step_id')\
            .eq('user_id', user_id)\
            .eq('completion_status', 'completed')\
            .execute()
        total_skills_count = len(total_skills_res.data)

        # KPI 2: Total Paths (count of completed roadmaps)
        total_paths_count = len([r for r in roadmaps if r['status'] == 'completed'])

        return jsonify({
            "success": True,
            "roadmaps": roadmaps,
            "stats": {
                "total_skills": total_skills_count,
                "total_paths": total_paths_count
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/feedback', methods=['GET'])
def get_feedback_reports():
    try:
        # FR6.3: Anonymize data by ONLY selecting non-identifying fields
        res = supabase.table('student_skill_gaps')\
            .select('skill_name, category, reason, created_at')\
            .order('created_at', desc=True)\
            .execute()
        
        return jsonify({
            "success": True, 
            "reports": res.data
        })
    except Exception as e:
        print(f"[ERROR] Fetching feedback failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)