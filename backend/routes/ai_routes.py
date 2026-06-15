import json
from flask import Blueprint, request, jsonify
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/admin/draft/steps', methods=['POST'])
def draft_steps():
    data = request.json
    career_name = data.get('career_name')
    print(f"[ADMIN] Drafting steps for: {career_name}")
    try:
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
        
        Return ONLY a valid JSON object matching this exact schema:
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

@ai_bp.route('/api/admin/draft/quizzes', methods=['POST'])
def draft_quizzes():
    skills = request.json.get('skills', [])
    print(f"[ADMIN] Drafting quizzes for skills: {skills}")
    try:
        prompt = f"""Generate 3 MCQs for each of these skills: {json.dumps(skills)}.
        RULES:
        1. 4 options per question.
        2. Tag difficulty: Beginner, Intermediate, or Advanced.
        3. 'correct_answer' must match one option exactly.
        
        Return ONLY JSON matching this structure:
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

            # Insert Quizzes
            sq = [q for q in data['quizzes'] if q['skill_name'] == step['skill_name']]
            if sq:
                for q_obj in sq[0]['questions']:
                    supabase.table('quiz').insert({"skill_id": s_id, "question": q_obj['question'], "options": q_obj['options'], "correct_answer": q_obj['correct_answer'], "difficulty": q_obj.get('difficulty', 'Beginner')}).execute()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
