# ============================================================================
# FILE: backend/app.py
# PURPOSE: High-Speed User API & Admin Background Triggers
# ============================================================================

import sys
import threading
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from background_generator import get_ai_response, clean_json

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
        # Students only see PUBLISHED paths
        res = supabase.table('career').select('*').eq('status', 'published').execute()
        return jsonify({"success": True, "careers": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/career/publish/<int:career_id>', methods=['POST'])
def publish_pathway(career_id):
    try:
        supabase.table('career').update({"status": 'published'}).eq('career_id', career_id).execute()
        return jsonify({"success": True, "message": "Pathway is now LIVE for students!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/commit-pathway', methods=['POST'])
def commit_pathway():
    """Final step: Save the approved draft as a DRAFT career"""
    data = request.json
    print(f"[ADMIN] Committing pathway as DRAFT: {data.get('career_name')}")
    try:
        # 1. Insert Career as DRAFT
        career_res = supabase.table('career').insert({
            "career_name": data['career_name'], 
            "description": data['description'],
            "status": "draft"
        }).execute()
        career_id = career_res.data[0]['career_id']

        for i, step in enumerate(data['steps']):
            # 2. Insert Skill
            skill_res = supabase.table('skill').insert({
                "skill_name": step['skill_name'], 
                "skill_category": step['category'], 
                "description": step['description'],
                "concept_tag": step.get('concept_tag')
            }).execute()
            skill_id = skill_res.data[0]['skill_id']

            # 3. Link Step
            supabase.table('roadmap_step').insert({
                "career_id": career_id, "skill_id": skill_id, "step_order": i + 1
            }).execute()

            # 4. Map Resources
            tag = step.get('concept_tag')
            verified = supabase.table('verified_resources').select('*').eq('concept_tag', tag).execute()
            if verified.data:
                for res in verified.data:
                    supabase.table('learning_resource').insert({
                        "skill_id": skill_id, "title": res['title'], 
                        "provider": res['provider'], "url": res['url'], "cost_type": "free"
                    }).execute()
            else:
                fallback_url = f"https://www.youtube.com/results?search_query={step['skill_name'].replace(' ', '+')}+tutorial"
                supabase.table('learning_resource').insert({
                    "skill_id": skill_id, "title": f"Intro to {step['skill_name']}", 
                    "provider": "YouTube", "url": fallback_url, "cost_type": "free"
                }).execute()

            # 5. Insert Approved Quizzes
            skill_quizzes = [q for q in data['quizzes'] if q['skill_name'] == step['skill_name']]
            if skill_quizzes:
                for q_obj in skill_quizzes[0]['questions']:
                    supabase.table('quiz').insert({
                        "skill_id": skill_id,
                        "question": q_obj['question'],
                        "options": q_obj['options'],
                        "correct_answer": q_obj['correct_answer'],
                        "difficulty": q_obj.get('difficulty', 'Beginner')
                    }).execute()

        return jsonify({"success": True, "message": f"Successfully saved {data['career_name']} as DRAFT!"})
    except Exception as e:
        print(f"[ERROR] Committing pathway failed: {str(e)}")
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
        # ⚡ UPDATED: Safer fetch without .single() to avoid PGRST116 crashes
        career_res = supabase.table('career').select('*').eq('career_id', career_id).execute()
        if not career_res.data:
            return jsonify({
                "success": False, 
                "error": "This career path no longer exists. Please return to the dashboard and start a new one."
            }), 404
        
        career_data = career_res.data[0]
        
        # ⚡ UPDATED: Fetch skill concept_tag to enable verified resource lookup
        steps_res = supabase.table('roadmap_step')\
            .select('step_id, step_order, skill(skill_id, skill_name, description, concept_tag)')\
            .eq('career_id', career_id)\
            .order('step_order')\
            .execute()

        steps_data = steps_res.data
        
        # --- REQUIREMENT A: INTERCEPT AND APPEND VERIFIED RESOURCES ---
        for step in steps_data:
            skill = step.get('skill')
            if skill and skill.get('concept_tag'):
                concept_tag = skill['concept_tag']
                # Query the VERIFIED_RESOURCES table for this tag
                verified_res = supabase.table('verified_resources').select('*').eq('concept_tag', concept_tag).execute()
                
                if verified_res.data:
                    skill['learning_resource'] = verified_res.data
                else:
                    # Fallback to search link if no verified resource is found
                    skill['learning_resource'] = [{
                        "title": f"Learn {skill['skill_name']} on YouTube",
                        "provider": "YouTube",
                        "url": f"https://www.youtube.com/results?search_query={skill['skill_name'].replace(' ', '+')}+tutorial",
                        "cost_type": "free"
                    }]

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
            total_steps_count = len(steps_data)
            # Count completed steps for this user in THIS specific career
            career_step_ids = [s['step_id'] for s in steps_data]
            user_career_completed_count = len([sid for sid in completed_steps if sid in career_step_ids])

            if user_career_completed_count == total_steps_count and not is_certified:
                is_eligible_for_quiz = True

        return jsonify({
            "success": True, 
            "career": career_res.data,
            "steps": steps_data,
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

@app.route('/api/submit-quiz', methods=['POST'])
def submit_quiz_graded():
    """
    Task A: Detailed Grading Endpoint
    Grades a single quiz submission by skill categories and inserts results.
    """
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        user_answers = data.get('answers', []) # Expected: [{"question_id": 1, "selected_answer": "A"}, ...]

        if not student_id or not user_answers:
            return jsonify({"success": False, "error": "Missing student_id or answers"}), 400

        # 1. Fetch correct answers and skill_id mapping from 'quiz' table
        question_ids = [a['question_id'] for a in user_answers]
        response = supabase.table('quiz').select('quiz_id, skill_id, correct_answer').in_('quiz_id', question_ids).execute()
        
        quiz_data = response.data
        if not quiz_data:
            return jsonify({"success": False, "error": "Questions not found"}), 404

        # 2. Map submissions for easy comparison
        submission_map = {str(a['question_id']): a['selected_answer'] for a in user_answers}
        
        # 3. Aggregate performance by skill_id
        skill_totals = {} # Format: {skill_id: {"correct": 0, "total": 0}}

        for item in quiz_data:
            s_id = item['skill_id']
            q_id = str(item['quiz_id'])
            
            if s_id not in skill_totals:
                skill_totals[s_id] = {"correct": 0, "total": 0}
            
            skill_totals[s_id]["total"] += 1
            if submission_map.get(q_id) == item['correct_answer']:
                skill_totals[s_id]["correct"] += 1

        # 4. Prepare bulk insert for 'quiz_result' table
        results_to_insert = []
        for s_id, stats in skill_totals.items():
            percentage_score = int((stats["correct"] / stats["total"]) * 100) if stats["total"] > 0 else 0
            results_to_insert.append({
                "user_id": student_id,
                "skill_id": s_id,
                "score": percentage_score
            })

        # 5. Insert into Supabase
        if results_to_insert:
            supabase.table('quiz_result').insert(results_to_insert).execute()

        return jsonify({
            "success": True,
            "message": f"Graded {len(results_to_insert)} skills successfully.",
            "results": results_to_insert
        }), 201

    except Exception as e:
        print(f"[ERROR] Submit-quiz failed: {e}")
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
        
        # ⚡ BUG FIX: Filter out roadmaps where the career was deleted (orphaned records)
        roadmaps = [r for r in roadmaps_res.data if r.get('career')]
        
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

@app.route('/api/admin/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Aggregates quiz results for the Admin Heatmap.
    Calculates avg score per skill for each academic year.
    Includes ALL generated skills, even those with 0 attempts.
    """
    try:
        # 1. Fetch ALL skills in the system + their career context (including status)
        # We join through roadmap_step to get the career details
        skills_res = supabase.table('roadmap_step')\
            .select('skill_id, skill(skill_name), career(career_id, career_name, status)')\
            .execute()
        
        all_roadmap_links = skills_res.data

        # 2. Fetch all quiz results joined with user academic_year
        res = supabase.table('quiz_result').select('score, skill_id, users(academic_year)').execute()
        raw_results = res.data

        # 3. Initialize aggregation for EVERY skill link
        aggregation = {}
        for link in all_roadmap_links:
            s = link.get('skill')
            c = link.get('career')
            if not s or not c: continue

            s_id = link['skill_id']
            # Using a composite key in case a skill is reused across careers
            key = f"{c['career_id']}_{s_id}"
            
            aggregation[key] = {
                "skill": s['skill_name'],
                "career_id": c['career_id'],
                "career_name": c['career_name'],
                "career_status": c.get('status', 'published'),
                "y1": [], "y2": [], "y3": [], "y4": []
            }

        # 4. Map existing results to aggregation
        for item in raw_results:
            s_id = item['skill_id']
            user_info = item.get('users')
            
            if not user_info: continue

            year = str(user_info['academic_year'])
            score = item['score']
            
            # Find all career keys that use this skill
            for key in aggregation:
                if key.endswith(f"_{s_id}"):
                    year_key = f"y{year}"
                    if year_key in aggregation[key]:
                        aggregation[key][year_key].append(score)

        # 5. Calculate Averages (or 0 if no attempts)
        final_heatmap = []
        for key, data in aggregation.items():
            row = {
                "skill": data["skill"],
                "career_id": data["career_id"],
                "career_name": data["career_name"],
                "career_status": data["career_status"]
            }
            for y in ["y1", "y2", "y3", "y4"]:
                scores = data[y]
                row[y] = round(sum(scores) / len(scores)) if scores else 0
            final_heatmap.append(row)

        return jsonify({
            "success": True,
            "heatmap": final_heatmap
        })
    except Exception as e:
        print(f"[ERROR] Heatmap aggregation failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/resources', methods=['GET'])
def admin_get_resources():
    tag = request.args.get('tag')
    try:
        if tag:
            res = supabase.table('verified_resources').select('*').eq('concept_tag', tag).execute()
        else:
            res = supabase.table('verified_resources').select('*').execute()
        return jsonify({"success": True, "resources": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/resources/add', methods=['POST'])
def admin_add_resource():
    data = request.json
    try:
        res = supabase.table('verified_resources').insert({
            "concept_tag": data['concept_tag'],
            "title": data['title'],
            "provider": data['provider'],
            "url": data['url'],
            "cost_type": data.get('cost_type', 'free')
        }).execute()
        return jsonify({"success": True, "resource": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/resources/delete/<int:resource_id>', methods=['DELETE'])
def admin_delete_resource(resource_id):
    try:
        supabase.table('verified_resources').delete().eq('resource_id', resource_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/career-skills', methods=['GET'])
def get_career_skills_map():
    try:
        # Get all careers and their skills for the management UI
        careers = supabase.table('career').select('career_id, career_name, status').execute()
        result = []
        for c in careers.data:
            skills = supabase.table('roadmap_step')\
                .select('skill(skill_id, skill_name, concept_tag)')\
                .eq('career_id', c['career_id'])\
                .execute()
            result.append({
                "career_id": c['career_id'],
                "career_name": c['career_name'],
                "status": c.get('status', 'published'),
                "skills": [s['skill'] for s in skills.data if s['skill']]
            })
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/quizzes', methods=['GET'])
def admin_get_quizzes():
    skill_id = request.args.get('skill_id')
    try:
        if not skill_id:
            return jsonify({"success": False, "error": "skill_id is required"}), 400
        res = supabase.table('quiz').select('*').eq('skill_id', skill_id).execute()
        return jsonify({"success": True, "quizzes": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/quizzes/save', methods=['POST'])
def admin_save_quiz():
    data = request.json
    quiz_id = data.get('quiz_id')
    payload = {
        "skill_id": data['skill_id'],
        "question": data['question'],
        "options": data['options'],
        "correct_answer": data['correct_answer'],
        "difficulty": data.get('difficulty', 'Beginner')
    }
    try:
        if quiz_id:
            res = supabase.table('quiz').update(payload).eq('quiz_id', quiz_id).execute()
        else:
            res = supabase.table('quiz').insert(payload).execute()
        return jsonify({"success": True, "quiz": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/quizzes/delete/<int:quiz_id>', methods=['DELETE'])
def admin_delete_quiz(quiz_id):
    try:
        supabase.table('quiz').delete().eq('quiz_id', quiz_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/career/delete/<int:career_id>', methods=['DELETE'])
def admin_delete_career(career_id):
    try:
        # ⚡ MANUAL CASCADE: Delete dependencies in order to avoid FK violations
        # 1. Get all steps and skills for this career
        steps = supabase.table('roadmap_step').select('step_id, skill_id').eq('career_id', career_id).execute()
        step_ids = [s['step_id'] for s in steps.data]
        skill_ids = [s['skill_id'] for s in steps.data]

        # 2. Delete progress records and user roadmaps
        if step_ids:
            supabase.table('progress_record').delete().in_('step_id', step_ids).execute()
        supabase.table('roadmap').delete().eq('career_id', career_id).execute()

        # 3. Delete roadmap steps
        supabase.table('roadmap_step').delete().eq('career_id', career_id).execute()

        # 4. Delete associated skills data (resources, quizzes, results)
        if skill_ids:
            supabase.table('learning_resource').delete().in_('skill_id', skill_ids).execute()
            supabase.table('quiz').delete().in_('skill_id', skill_ids).execute()
            supabase.table('quiz_result').delete().in_('skill_id', skill_ids).execute()
            supabase.table('skill').delete().in_('skill_id', skill_ids).execute()

        # 5. Finally, delete the career itself
        supabase.table('career').delete().eq('career_id', career_id).execute()
        
        return jsonify({"success": True, "message": "Career and all dependencies deleted."})
    except Exception as e:
        print(f"[ERROR] Career deletion failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/draft/steps', methods=['POST'])
def draft_steps():
    data = request.json
    career_name = data.get('career_name')
    print(f"[ADMIN] Drafting steps for: {career_name}")
    try:
        # Get existing verified tags to guide the AI
        verified_tags_res = supabase.table('verified_resources').select('concept_tag').execute()
        available_tags = list(set([r['concept_tag'] for r in verified_tags_res.data]))
        tags_list_str = ", ".join(available_tags)

        prompt = f"""You are a Senior Curriculum Engineer. 
        TASK: Draft a specialized learning roadmap for a '{career_name}'.
        
        RULES:
        1. CONTENT: Focus EXCLUSIVELY on the technical and professional skills required for an '{career_name}'. 
           - Avoid generic Software Engineering steps unless they are 100% core to this specific role.
        2. SKILLS: For each skill, provide a 'concept_tag' (a short slug-style string).
        3. RESOURCE AWARENESS: 
           - We already have resources for these tags: [{tags_list_str}]. 
           - IF (and only if) one of these tags perfectly matches a skill you drafted, use it.
           - Otherwise, create a NEW specific tag for that skill.
        
        Return ONLY a valid JSON object:
        {{
            "description": "Professional summary of the {career_name} role",
            "steps": [
                {{
                    "skill_name": "Industry standard name of the skill",
                    "concept_tag": "specific-tag-name",
                    "category": "Technical",
                    "description": "Detailed explanation of why this skill is vital for a {career_name}"
                }}
            ]
        }}"""
        
        response_text = get_ai_response(prompt)
        print(f"[AI] Draft response generated for {career_name}.")
        draft = json.loads(clean_json(response_text))
        return jsonify({"success": True, "draft": draft})
    except Exception as e:
        print(f"[ERROR] Drafting steps failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/draft/quizzes', methods=['POST'])
def draft_quizzes():
    data = request.json # Expects a list of skill names/tags
    skills = data.get('skills', [])
    print(f"[ADMIN] Drafting quizzes for skills: {skills}")
    try:
        prompt = f"""Generate 3 MCQs for each of these skills: {json.dumps(skills)}.
        RULES:
        1. 4 options per question.
        2. Tag difficulty: Beginner, Intermediate, or Advanced.
        3. 'correct_answer' must match one option exactly.
        
        Return ONLY JSON:
        {{
            "quizzes": [
                {{
                    "skill_name": "Matching skill name from input",
                    "questions": [
                        {{
                            "question": "Text",
                            "options": ["A", "B", "C", "D"],
                            "correct_answer": "A",
                            "difficulty": "Intermediate"
                        }}
                    ]
                }}
            ]
        }}"""
        response_text = get_ai_response(prompt)
        draft = json.loads(clean_json(response_text))
        return jsonify({"success": True, "draft": draft})
    except Exception as e:
        print(f"[ERROR] Drafting quizzes failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)