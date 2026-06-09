import sys
import threading
import subprocess
import json
from flask import Blueprint, request, jsonify
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/sync', methods=['POST'])
def admin_sync_content():
    try:
        def run_background_script():
            try:
                subprocess.run([sys.executable, "background_generator.py"], check=True)
            except Exception as e:
                print(f"[WORKER] Error: {e}")

        threading.Thread(target=run_background_script).start()
        return jsonify({"success": True, "message": "Sync started in background"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/feedback', methods=['GET'])
def get_feedback_reports():
    try:
        res = supabase.table('student_skill_gaps').select('skill_name, category, reason, created_at').order('created_at', desc=True).execute()
        return jsonify({"success": True, "reports": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/heatmap', methods=['GET'])
def get_heatmap_data():
    try:
        # Join to get career name and status
        links_res = supabase.table('roadmap_step').select('skill_id, skill(skill_name), career(career_id, career_name, status)').execute()
        results_res = supabase.table('quiz_result').select('score, skill_id, users(academic_year)').execute()
        
        aggregation = {}
        for link in links_res.data:
            s, c = link.get('skill'), link.get('career')
            if not s or not c: continue
            key = f"{c['career_id']}_{link['skill_id']}"
            aggregation[key] = {
                "skill": s['skill_name'], 
                "career_id": c['career_id'], 
                "career_name": c['career_name'], 
                "career_status": c.get('status', 'published'), 
                "y1":[], "y2":[], "y3":[], "y4":[]
            }

        for item in results_res.data:
            u = item.get('users')
            if not u or not u.get('academic_year'): continue
            
            # Robust string parsing: extract the number from strings like "Year 2" or "2"
            raw_year = str(u['academic_year']).lower().replace('year', '').strip()
            if raw_year not in ['1', '2', '3', '4']: continue
            
            year_key = f"y{raw_year}"
            
            for key in aggregation:
                if key.endswith(f"_{item['skill_id']}"):
                    if year_key in aggregation[key]: 
                        aggregation[key][year_key].append(item['score'])

        final = []
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
            final.append(row)
        return jsonify({"success": True, "heatmap": final})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/resources', methods=['GET'])
def admin_get_resources():
    tag = request.args.get('tag')
    try:
        query = supabase.table('verified_resources').select('*')
        if tag: query = query.eq('concept_tag', tag)
        res = query.execute()
        return jsonify({"success": True, "resources": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/resources/add', methods=['POST'])
def admin_add_resource():
    try:
        res = supabase.table('verified_resources').insert(request.json).execute()
        return jsonify({"success": True, "resource": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/resources/delete/<int:resource_id>', methods=['DELETE'])
def admin_delete_resource(resource_id):
    try:
        supabase.table('verified_resources').delete().eq('resource_id', resource_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/career-skills', methods=['GET'])
def get_career_skills_map():
    try:
        careers = supabase.table('career').select('career_id, career_name, status').execute()
        result = []
        for c in careers.data:
            steps = supabase.table('roadmap_step')\
                .select('step_order, skill(skill_id, skill_name, concept_tag)')\
                .eq('career_id', c['career_id'])\
                .order('step_order')\
                .execute()
            
            mapped_skills = []
            for s in steps.data:
                if s['skill']:
                    skill_data = s['skill']
                    skill_data['step_order'] = s['step_order']
                    mapped_skills.append(skill_data)

            result.append({
                "career_id": c['career_id'], 
                "career_name": c['career_name'], 
                "status": c.get('status', 'published'), 
                "skills": mapped_skills
            })
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@admin_bp.route('/api/admin/career/add-skill', methods=['POST'])
def add_manual_skill():
    data = request.json
    c_id = data['career_id']
    target_step = data['step_order']
    try:
        # ⚡ SMART RE-ORDER: Shift existing steps UP to make room
        supabase.rpc('shift_roadmap_steps_up', {
            'p_career_id': c_id, 
            'p_start_step': target_step
        }).execute()

        # 1. Insert Skill
        skill_res = supabase.table('skill').insert({
            "skill_name": data['skill_name'],
            "description": data['description'],
            "concept_tag": data['concept_tag'],
            "skill_category": "Technical"
        }).execute()
        skill_id = skill_res.data[0]['skill_id']

        # 2. Link to Career at the now-empty slot
        supabase.table('roadmap_step').insert({
            "career_id": c_id,
            "skill_id": skill_id,
            "step_order": target_step
        }).execute()

        return jsonify({"success": True, "skill_id": skill_id})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/career/delete-skill', methods=['DELETE'])
def delete_roadmap_skill():
    career_id = request.args.get('career_id')
    skill_id = request.args.get('skill_id')
    step_order = request.args.get('step_order', type=int)

    try:
        # 1. Delete dependencies (Cascading)
        supabase.table('learning_resource').delete().eq('skill_id', skill_id).execute()
        supabase.table('quiz').delete().eq('skill_id', skill_id).execute()
        supabase.table('quiz_result').delete().eq('skill_id', skill_id).execute()

        # 2. Remove from roadmap
        supabase.table('roadmap_step').delete().eq('career_id', career_id).eq('skill_id', skill_id).execute()

        # 3. Delete the base skill record
        supabase.table('skill').delete().eq('skill_id', skill_id).execute()

        # ⚡ SMART RE-ORDER: Shift subsequent steps DOWN to fill the gap
        supabase.rpc('shift_roadmap_steps_down', {
            'p_career_id': int(career_id), 
            'p_start_step': step_order
        }).execute()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@admin_bp.route('/api/admin/skill/generate-quiz', methods=['POST'])
def generate_skill_quiz():
    data = request.json
    skill_name = data.get('skill_name')
    try:
        prompt = f"""You are a Senior Assessment Designer. 
        Generate 3 MCQs for the technical skill: '{skill_name}'.
        
        RULES:
        1. 4 options per question.
        2. Assign difficulty: Beginner, Intermediate, or Advanced.
        3. 'correct_answer' MUST match one option exactly.
        
        Return ONLY valid JSON:
        {{
            "questions": [
                {{
                    "question": "Question text",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A",
                    "difficulty": "Intermediate"
                }}
            ]
        }}"""
        
        response_text = get_ai_response(prompt)
        ai_data = json.loads(clean_json(response_text))
        
        # ⚡ UPDATED: We return the draft for Admin Review instead of saving
        return jsonify({"success": True, "draft": ai_data['questions']})
    except Exception as e:
        print(f"[ERROR] Manual Quiz Generation Failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/skill/save-quizzes', methods=['POST'])
def save_reviewed_quizzes():
    data = request.json # {skill_id: 1, questions: [...]}
    try:
        skill_id = data['skill_id']
        for q in data['questions']:
            supabase.table('quiz').insert({
                "skill_id": skill_id,
                "question": q['question'],
                "options": q['options'],
                "correct_answer": q['correct_answer'],
                "difficulty": q.get('difficulty', 'Intermediate')
            }).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/quizzes', methods=['GET'])
def admin_get_quizzes():
    try:
        res = supabase.table('quiz').select('*').eq('skill_id', request.args.get('skill_id')).execute()
        return jsonify({"success": True, "quizzes": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/quizzes/save', methods=['POST'])
def admin_save_quiz():
    data = request.json
    q_id = data.get('quiz_id')
    payload = {
        "skill_id": data['skill_id'], 
        "question": data['question'], 
        "options": data['options'], 
        "correct_answer": data['correct_answer'], 
        "difficulty": data.get('difficulty', 'Beginner')
    }
    try:
        if q_id: res = supabase.table('quiz').update(payload).eq('quiz_id', q_id).execute()
        else: res = supabase.table('quiz').insert(payload).execute()
        return jsonify({"success": True, "quiz": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/quizzes/delete/<int:quiz_id>', methods=['DELETE'])
def admin_delete_quiz(quiz_id):
    try:
        supabase.table('quiz').delete().eq('quiz_id', quiz_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/career/delete/<int:career_id>', methods=['DELETE'])
def admin_delete_career(career_id):
    try:
        steps = supabase.table('roadmap_step').select('step_id, skill_id').eq('career_id', career_id).execute()
        step_ids = [s['step_id'] for s in steps.data]
        skill_ids = [s['skill_id'] for s in steps.data]
        if step_ids: supabase.table('progress_record').delete().in_('step_id', step_ids).execute()
        supabase.table('roadmap').delete().eq('career_id', career_id).execute()
        supabase.table('roadmap_step').delete().eq('career_id', career_id).execute()
        if skill_ids:
            supabase.table('learning_resource').delete().in_('skill_id', skill_ids).execute()
            supabase.table('quiz').delete().in_('skill_id', skill_ids).execute()
            supabase.table('quiz_result').delete().in_('skill_id', skill_ids).execute()
            supabase.table('skill').delete().in_('skill_id', skill_ids).execute()
        supabase.table('career').delete().eq('career_id', career_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/career/reorder-skill', methods=['POST'])
def reorder_roadmap_skill():
    """Moves a skill UP or DOWN and auto-normalizes the entire path"""
    data = request.json
    c_id = data['career_id']
    s_id = data['skill_id']
    direction = data['direction'] # 'up' or 'down'
    current_order = data['step_order']
    
    try:
        new_order = current_order - 1 if direction == 'up' else current_order + 1
        if new_order < 1: return jsonify({"success": False, "error": "Already at step 1"}), 400

        # 1. Swap the steps
        # Move the other skill to a temporary high number to avoid uniqueness collision if any
        supabase.table('roadmap_step').update({"step_order": 999}).eq('career_id', c_id).eq('step_order', new_order).execute()
        supabase.table('roadmap_step').update({"step_order": new_order}).eq('career_id', c_id).eq('skill_id', s_id).execute()
        supabase.table('roadmap_step').update({"step_order": current_order}).eq('career_id', c_id).eq('step_order', 999).execute()

        # 2. Final Normalization (Ensures 1, 2, 3... sequence)
        supabase.rpc('normalize_roadmap', {'p_career_id': c_id}).execute()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/curation/log', methods=['POST'])
def log_curation_action():
    data = request.json
    try:
        payload = {
            "content_type": data['content_type'],
            "content_id": data['content_id'],
            "vote_type": data['vote_type'],
            "admin_comment": data.get('admin_comment'),
            "suggested_value": data.get('suggested_value'),
            "admin_id": data.get('admin_id')
        }
        res = supabase.table('admin_curation_log').insert(payload).execute()
        return jsonify({"success": True, "log": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/curation/logs', methods=['GET'])
def get_curation_logs():
    try:
        res = supabase.table('admin_curation_log').select('*').order('created_at', desc=True).execute()
        return jsonify({"success": True, "logs": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/api/admin/career/publish/<int:career_id>', methods=['POST'])
def publish_pathway(career_id):
    try:
        supabase.table('career').update({"status": 'published'}).eq('career_id', career_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
