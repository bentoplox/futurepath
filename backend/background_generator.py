import json
import time
from services.supabase_service import supabase
from services.ai_service import get_ai_response, clean_json

# --- CONFIGURATION ---
TARGET_CAREERS = [
    "Software Engineer", 
    "Data Scientist"
]

def run_slow_generation():
    print(f"[BACKGROUND WORKER] Starting generation for {len(TARGET_CAREERS)} careers...")

    for career_name in TARGET_CAREERS:
        # Check if career exists and clean up stale data
        existing_career = supabase.table('career').select('career_id').eq('career_name', career_name).execute()
        if existing_career.data:
            c_id = existing_career.data[0]['career_id']
            print(f"[CLEANUP] Removing stale data for {career_name}...")
            
            steps_res = supabase.table('roadmap_step').select('step_id, skill_id').eq('career_id', c_id).execute()
            step_ids = [s['step_id'] for s in steps_res.data]
            skill_ids = [s['skill_id'] for s in steps_res.data]

            if step_ids: supabase.table('progress_record').delete().in_('step_id', step_ids).execute()
            supabase.table('roadmap').delete().eq('career_id', c_id).execute()
            supabase.table('roadmap_step').delete().eq('career_id', c_id).execute()

            if skill_ids:
                supabase.table('learning_resource').delete().in_('skill_id', skill_ids).execute()
                supabase.table('quiz').delete().in_('skill_id', skill_ids).execute()
                supabase.table('quiz_result').delete().in_('skill_id', skill_ids).execute()
                supabase.table('skill').delete().in_('skill_id', skill_ids).execute()

            supabase.table('career').delete().eq('career_id', c_id).execute()

        # FETCH AVAILABLE VERIFIED TAGS
        verified_tags_res = supabase.table('verified_resources').select('concept_tag').execute()
        available_tags = list(set([r['concept_tag'] for r in verified_tags_res.data]))
        tags_list_str = ", ".join(available_tags)

        print(f"[WAIT] Architecting roadmap for: {career_name}...")
        
        prompt = f"""You are a Senior Curriculum Engineer. Create specialized roadmap for '{career_name}'.
        Existing tags: [{tags_list_str}]. 3 MCQs per skill (4 options, difficulty). Return JSON."""

        try:
            response_text = get_ai_response(prompt)
            data = json.loads(clean_json(response_text))

            career_res = supabase.table('career').insert({"career_name": career_name, "description": data['description'], "status": "published"}).execute()
            career_id = career_res.data[0]['career_id']

            for i, step in enumerate(data['steps']):
                skill_res = supabase.table('skill').insert({"skill_name": step['skill_name'], "skill_category": step['category'], "description": step['description'], "concept_tag": step.get('concept_tag')}).execute()
                skill_id = skill_res.data[0]['skill_id']
                supabase.table('roadmap_step').insert({"career_id": career_id, "skill_id": skill_id, "step_order": i + 1}).execute()

                # Resources
                tag = step.get('concept_tag')
                verified = supabase.table('verified_resources').select('*').eq('concept_tag', tag).execute()
                if verified.data:
                    for res in verified.data:
                        supabase.table('learning_resource').insert({"skill_id": skill_id, "title": res['title'], "provider": res['provider'], "url": res['url'], "cost_type": "free"}).execute()
                else:
                    url = f"https://www.youtube.com/results?search_query={step['skill_name'].replace(' ', '+')}+tutorial"
                    supabase.table('learning_resource').insert({"skill_id": skill_id, "title": f"Intro to {step['skill_name']}", "provider": "YouTube", "url": url, "cost_type": "free"}).execute()

                # Quizzes
                import random as py_random
                for q in step.get('quizzes', []):
                    if q['correct_answer'] not in q['options']: q['correct_answer'] = q['options'][0]
                    py_random.shuffle(q['options'])
                    supabase.table('quiz').insert({"skill_id": skill_id, "question": q['question'], "options": q['options'], "correct_answer": q['correct_answer'], "difficulty": q.get('difficulty', 'Beginner')}).execute()

            print(f"[SUCCESS] {career_name} stored.")
            time.sleep(2) 

        except Exception as e:
            print(f"[ERROR] {career_name} failed: {e}")

if __name__ == "__main__":
    run_slow_generation()
