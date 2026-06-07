import random
from flask import Blueprint, request, jsonify
from services.supabase_service import supabase

student_bp = Blueprint('student', __name__)

@student_bp.route('/api/careers', methods=['GET'])
def get_all_careers():
    try:
        res = supabase.table('career').select('*').eq('status', 'published').execute()
        return jsonify({"success": True, "careers": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/enroll', methods=['POST'])
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

@student_bp.route('/api/roadmap/<int:career_id>', methods=['GET'])
def get_career_roadmap(career_id):
    user_id = request.args.get('user_id')
    try:
        career_res = supabase.table('career').select('*').eq('career_id', career_id).execute()
        if not career_res.data:
            return jsonify({"success": False, "error": "Career path not found"}), 404
        
        career_data = career_res.data[0]
        steps_res = supabase.table('roadmap_step')\
            .select('step_id, step_order, skill(skill_id, skill_name, description, concept_tag)')\
            .eq('career_id', career_id)\
            .order('step_order')\
            .execute()

        steps_data = steps_res.data
        
        for step in steps_data:
            skill = step.get('skill')
            if skill and skill.get('concept_tag'):
                concept_tag = skill['concept_tag']
                verified_res = supabase.table('verified_resources').select('*').eq('concept_tag', concept_tag).execute()
                
                if verified_res.data:
                    skill['learning_resource'] = verified_res.data
                else:
                    skill['learning_resource'] = [{
                        "title": f"Learn {skill['skill_name']} on YouTube",
                        "provider": "YouTube",
                        "url": f"https://www.youtube.com/results?search_query={skill['skill_name'].replace(' ', '+')}+tutorial",
                        "cost_type": "free"
                    }]

        completed_steps = []
        is_eligible_for_quiz = False
        is_certified = False

        if user_id:
            progress_res = supabase.table('progress_record').select('step_id').eq('user_id', user_id).eq('completion_status', 'completed').execute()
            completed_steps = [p['step_id'] for p in progress_res.data]

            roadmap_res = supabase.table('roadmap').select('status').eq('user_id', user_id).eq('career_id', career_id).execute()
            roadmap_status = roadmap_res.data[0]['status'] if roadmap_res.data else 'active'
            is_certified = (roadmap_status == 'completed')

            career_step_ids = [s['step_id'] for s in steps_data]
            user_career_completed_count = len([sid for sid in completed_steps if sid in career_step_ids])

            if user_career_completed_count == len(steps_data) and not is_certified:
                is_eligible_for_quiz = True

        return jsonify({
            "success": True, 
            "career": career_data,
            "steps": steps_data,
            "completed_steps": completed_steps,
            "is_eligible_for_quiz": is_eligible_for_quiz,
            "is_certified": is_certified
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/submit-quiz', methods=['POST'])
def submit_quiz_graded():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        user_answers = data.get('answers', [])

        if not student_id or not user_answers:
            return jsonify({"success": False, "error": "Missing data"}), 400

        question_ids = [a['question_id'] for a in user_answers]
        response = supabase.table('quiz').select('quiz_id, skill_id, correct_answer').in_('quiz_id', question_ids).execute()
        
        quiz_data = response.data
        submission_map = {str(a['question_id']): a['selected_answer'] for a in user_answers}
        skill_totals = {}

        for item in quiz_data:
            s_id = item['skill_id']
            q_id = str(item['quiz_id'])
            if s_id not in skill_totals:
                skill_totals[s_id] = {"correct": 0, "total": 0}
            skill_totals[s_id]["total"] += 1
            if submission_map.get(q_id) == item['correct_answer']:
                skill_totals[s_id]["correct"] += 1

        results_to_insert = []
        for s_id, stats in skill_totals.items():
            percentage_score = int((stats["correct"] / stats["total"]) * 100) if stats["total"] > 0 else 0
            results_to_insert.append({"user_id": student_id, "skill_id": s_id, "score": percentage_score})

        if results_to_insert:
            supabase.table('quiz_result').insert(results_to_insert).execute()

        return jsonify({"success": True, "results": results_to_insert}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/quiz/<int:skill_id>', methods=['GET'])
def get_skill_quiz(skill_id):
    try:
        quiz_res = supabase.table('quiz').select('*').eq('skill_id', skill_id).execute()
        return jsonify({"success": True, "questions": quiz_res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/progress', methods=['POST'])
def update_progress():
    data = request.json
    user_id = data.get('user_id')
    step_id = data.get('step_id')
    status = data.get('status', 'completed')
    try:
        supabase.table('progress_record').delete().eq('user_id', user_id).eq('step_id', step_id).execute()
        if status == 'completed':
            supabase.table('progress_record').insert({"user_id": user_id, "step_id": step_id, "completion_status": 'completed'}).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/capstone/<int:career_id>', methods=['GET'])
def get_capstone_quiz(career_id):
    try:
        steps = supabase.table('roadmap_step').select('skill_id').eq('career_id', career_id).execute()
        skill_ids = [s['skill_id'] for s in steps.data]
        quizzes = supabase.table('quiz').select('*').in_('skill_id', skill_ids).execute()
        
        final_questions = quizzes.data
        if len(final_questions) > 20:
            final_questions = random.sample(final_questions, 20)
        
        return jsonify({"success": True, "questions": final_questions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@student_bp.route('/api/user/dashboard/<user_id>', methods=['GET'])
def get_user_dashboard(user_id):
    try:
        roadmaps_res = supabase.table('roadmap').select('*, career(*)').eq('user_id', user_id).execute()
        roadmaps = [r for r in roadmaps_res.data if r.get('career')]
        
        for rm in roadmaps:
            c_id = rm['career_id']
            steps_res = supabase.table('roadmap_step').select('step_id').eq('career_id', c_id).execute()
            step_ids = [s['step_id'] for s in steps_res.data]
            completed_res = supabase.table('progress_record').select('step_id').eq('user_id', user_id).in_('step_id', step_ids).eq('completion_status', 'completed').execute()
            
            rm['progress_percent'] = round((len(completed_res.data) / len(step_ids) * 100)) if step_ids else 0
            rm['is_certified'] = (rm['status'] == 'completed')

        return jsonify({"success": True, "roadmaps": roadmaps})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
