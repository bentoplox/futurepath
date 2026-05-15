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
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDA3NzksImV4cCI6MjA4MjYxNjc3OX0.I-uxcI0VeMaw3tcuQeFabcpBzmh1TvUJ3C1TG4ASu8I" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/api/admin/sync', methods=['POST'])
def admin_sync_content():
    try:
        print("[ADMIN] Requested AI Database Generation.")
        def run_background_script():
            subprocess.run([sys.executable, "background_generator.py"])

        thread = threading.Thread(target=run_background_script)
        thread.start()
        
        return jsonify({
            "success": True, 
            "message": "AI Generation started in the background!"
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
    try:
        existing = supabase.table('roadmap').select('*').eq('user_id', user_id).eq('career_id', career_id).execute()
        if not existing.data:
            supabase.table('roadmap').insert({"user_id": user_id, "career_id": career_id, "status": "active"}).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/roadmap/<int:career_id>', methods=['GET'])
def get_career_roadmap(career_id):
    try:
        career_res = supabase.table('career').select('*').eq('career_id', career_id).single().execute()
        steps_res = supabase.table('roadmap_step')\
            .select('step_id, step_order, skill(skill_id, skill_name, description, learning_resource(title, provider, url, cost_type))')\
            .eq('career_id', career_id)\
            .order('step_order')\
            .execute()

        return jsonify({
            "success": True, 
            "career": career_res.data,
            "steps": steps_res.data
        })
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
    if not user_id or not step_id:
        return jsonify({"error": "Missing required data"}), 400
    try:
        supabase.table('progress_record').upsert({
            "user_id": user_id,
            "step_id": step_id,
            "completion_status": status
        }).execute()
        return jsonify({"success": True, "message": "Progress recorded successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)