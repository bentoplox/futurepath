import json
from flask import Blueprint, request, jsonify
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/admin/draft/steps', methods=['POST'])
def draft_steps():
    data = request.json
    career_name = data.get('career_name')
    try:
        verified_tags_res = supabase.table('verified_resources').select('concept_tag').execute()
        available_tags = list(set([r['concept_tag'] for r in verified_tags_res.data]))
        tags_list_str = ", ".join(available_tags)

        prompt = f"""You are a Senior Curriculum Engineer. Draft specialized roadmap for '{career_name}'.
        RULES:
        1. CONTENT: Focus exclusively on technical skills for '{career_name}'.
        2. RESOURCE AWARENESS: Existing tags: [{tags_list_str}]. Use them if perfect match.
        Return ONLY valid JSON with 'description' and 'steps' (skill_name, concept_tag, category, description)."""
        
        response_text = get_ai_response(prompt)
        draft = json.loads(clean_json(response_text))
        return jsonify({"success": True, "draft": draft})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@ai_bp.route('/api/admin/draft/quizzes', methods=['POST'])
def draft_quizzes():
    skills = request.json.get('skills', [])
    try:
        prompt = f"Generate 3 MCQs (4 options, difficulty, correct_answer) for each skill: {json.dumps(skills)}. Return ONLY JSON."
        response_text = get_ai_response(prompt)
        draft = json.loads(clean_json(response_text))
        return jsonify({"success": True, "draft": draft})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@ai_bp.route('/api/admin/commit-pathway', methods=['POST'])
def commit_pathway():
    data = request.json
    try:
        c_res = supabase.table('career').insert({"career_name": data['career_name'], "description": data['description'], "status": "draft"}).execute()
        c_id = c_res.data[0]['career_id']

        for i, step in enumerate(data['steps']):
            s_res = supabase.table('skill').insert({"skill_name": step['skill_name'], "skill_category": step['category'], "description": step['description'], "concept_tag": step.get('concept_tag')}).execute()
            s_id = s_res.data[0]['skill_id']
            supabase.table('roadmap_step').insert({"career_id": c_id, "skill_id": s_id, "step_order": i + 1}).execute()

            # Map resources
            tag = step.get('concept_tag')
            verified = supabase.table('verified_resources').select('*').eq('concept_tag', tag).execute()
            if verified.data:
                for res in verified.data:
                    supabase.table('learning_resource').insert({"skill_id": s_id, "title": res['title'], "provider": res['provider'], "url": res['url'], "cost_type": "free"}).execute()
            else:
                url = f"https://www.youtube.com/results?search_query={step['skill_name'].replace(' ', '+')}+tutorial"
                supabase.table('learning_resource').insert({"skill_id": s_id, "title": f"Intro to {step['skill_name']}", "provider": "YouTube", "url": url, "cost_type": "free"}).execute()

            # Insert Quizzes
            sq = [q for q in data['quizzes'] if q['skill_name'] == step['skill_name']]
            if sq:
                for q_obj in sq[0]['questions']:
                    supabase.table('quiz').insert({"skill_id": s_id, "question": q_obj['question'], "options": q_obj['options'], "correct_answer": q_obj['correct_answer'], "difficulty": q_obj.get('difficulty', 'Beginner')}).execute()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
