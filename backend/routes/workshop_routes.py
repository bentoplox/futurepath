from flask import Blueprint, jsonify
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json
import json

workshop_bp = Blueprint('workshop', __name__)

@workshop_bp.route('/api/admin/ai-workshop-recommendations', methods=['GET'])
def get_ai_workshop_recommendations():
    try:
        # 1. Fetch Low Quiz Scores (< 70)
        # We need to join with skill and roadmap_step to get career names
        quiz_res = supabase.table('quiz_result').select('score, skill_id, skill(skill_name, skill_category)').lt('score', 70).execute()
        
        # 2. Fetch Open Skill Gap Reports
        gap_res = supabase.table('student_skill_gaps').select('skill_name, category, reason').eq('status', 'open').execute()
        
        # 3. Fetch Skill-Career Mapping
        mapping_res = supabase.table('roadmap_step').select('skill_id, career(career_name)').execute()
        
        # Map skill_id to career names
        skill_to_careers = {}
        for item in mapping_res.data:
            s_id = item['skill_id']
            c_name = item.get('career', {}).get('career_name')
            if s_id not in skill_to_careers:
                skill_to_careers[s_id] = set()
            if c_name:
                skill_to_careers[s_id].add(c_name)

        # Aggregate data for LangChain
        aggregated_data = {
            "low_scores": [],
            "student_feedback": gap_res.data
        }

        for q in quiz_res.data:
            s_id = q['skill_id']
            s_info = q.get('skill', {})
            careers = list(skill_to_careers.get(s_id, ["General"]))
            aggregated_data["low_scores"].append({
                "skill_name": s_info.get('skill_name'),
                "category": s_info.get('skill_category'),
                "score": q['score'],
                "careers": careers
            })

        # Prepare Prompt for LangChain
        prompt = f"""
        You are a University Curriculum Consultant for FCSIT Malaya (FSKTM UM). 
        Based on the following student performance data and qualitative feedback, recommend specific university workshops to bridge these skill gaps.

        DATA:
        {json.dumps(aggregated_data, indent=2)}

        INSTRUCTIONS:
        1. Identify the most critical failing areas.
        2. Propose high-impact workshops.
        3. Return a structured JSON array of workshop suggestions.
        
        Required JSON Response Fields:
        - title: (e.g., "Advanced SQL Query Optimization Masterclass")
        - target_track: (The specific career_name affected, e.g., "Data Scientist")
        - justification: (A clear sentence summarizing the failing quiz average and specific student complaints)
        - agenda: (An array of 3 core bullet points to be taught)
        - urgency_level: ("High" if score is critically low (<50) or complaints are frequent, otherwise "Medium")

        Return ONLY the JSON array.
        """

        ai_response = get_ai_response(prompt)
        recommendations = json.loads(clean_json(ai_response))

        return jsonify({
            "success": True,
            "recommendations": recommendations
        })

    except Exception as e:
        print(f"[ERROR] Workshop Recommendations Failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
