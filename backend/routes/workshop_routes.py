from flask import Blueprint, jsonify
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json
import json

workshop_bp = Blueprint('workshop', __name__)

@workshop_bp.route('/api/admin/ai-workshop-recommendations', methods=['GET'])
def get_ai_workshop_recommendations():
    try:
        # 1. Fetch ALL Low Quiz Scores (< 70) for aggregation
        quiz_res = supabase.table('quiz_result').select('score, skill_id, skill(skill_name, skill_category)').lt('score', 70).execute()
        
        # 2. Fetch Open Skill Gap Reports (Limit to latest 10 to save tokens)
        gap_res = supabase.table('student_skill_gaps').select('skill_name, category, reason').eq('status', 'open').order('created_at', desc=True).limit(10).execute()
        
        # 3. Fetch Skill-Career Mapping
        mapping_res = supabase.table('roadmap_step').select('skill_id, career(career_name)').execute()
        
        skill_to_careers = {}
        for item in mapping_res.data:
            s_id = item['skill_id']
            c_name = item.get('career', {}).get('career_name')
            if s_id not in skill_to_careers:
                skill_to_careers[s_id] = set()
            if c_name:
                skill_to_careers[s_id].add(c_name)

        # ⚡ DATA COMPRESSION: Aggregate scores by Skill instead of sending raw rows
        skill_summaries = {}
        for q in quiz_res.data:
            s_id = q['skill_id']
            s_info = q.get('skill', {})
            s_name = s_info.get('skill_name', 'Unknown')
            
            if s_name not in skill_summaries:
                skill_summaries[s_name] = {
                    "skill": s_name,
                    "cat": s_info.get('skill_category'),
                    "avg": 0,
                    "count": 0,
                    "tracks": list(skill_to_careers.get(s_id, ["General"]))
                }
            
            summary = skill_summaries[s_name]
            summary["avg"] = (summary["avg"] * summary["count"] + q['score']) / (summary["count"] + 1)
            summary["count"] += 1

        # ⚡ ROUNDING: Ensure averages are clean (1 decimal place)
        for s_name in skill_summaries:
            skill_summaries[s_name]["avg"] = round(skill_summaries[s_name]["avg"], 1)

        # Final Aggregated Data Structure (Top 10 Most Failed Skills)
        aggregated_data = {
            "top_failing_skills": sorted(list(skill_summaries.values()), key=lambda x: x['count'], reverse=True)[:10],
            "recent_feedback": gap_res.data
        }

        # Prepare Prompt for LangChain (Optimized for tokens)
        prompt = f"""
        Role: FSKTM UM Curriculum Consultant. 
        Task: Recommend exactly 9 high-impact interventions (Workshops or Hackathons) based on this data.
        
        DATA SUMMARY:
        {json.dumps(aggregated_data, separators=(',', ':'))}

        INSTRUCTIONS:
        1. Mix traditional Workshops with competitive Hackathons to deepen skill mastery.
        2. Combine related skill gaps where possible.
        3. Provide exactly 9 recommendations in a structured JSON array.
        
        Fields:
        - title: (e.g., "Web3 Security Hackathon" or "Python API Workshop")
        - target_track: (The affected career path)
        - justification: (1 sentence link to stats/feedback)
        - agenda: (Array of 3 bullet points)
        - urgency_level: ("High" or "Medium")

        Return ONLY the raw JSON array.
        """

        ai_response = get_ai_response(prompt)
        recommendations = json.loads(clean_json(ai_response))

        return jsonify({
            "success": True,
            "recommendations": recommendations[:9] # Strict limit
        })

    except Exception as e:
        print(f"[ERROR] Optimized AI Analysis Failed: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
