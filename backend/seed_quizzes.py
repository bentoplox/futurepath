# ============================================================================
# FILE: backend/seed_quizzes.py
# PURPOSE: Uploads hardcoded quizzes to the LAST skill of a career
# ============================================================================

import json
from supabase import create_client, Client

SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
# MAKE SURE to replace this with your actual Service Role Key!
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_quizzes():
    print("🎓 Starting Quiz Seeder...")
    
    with open('master_quizzes.json', 'r') as file:
        data = json.load(file)

    for career_data in data:
        career_name = career_data['career_name']
        print(f"\n🔍 Processing {career_name}...")

        # 1. Find the career_id
        career_res = supabase.table('career').select('career_id').eq('career_name', career_name).execute()
        if not career_res.data:
            print(f"❌ Career '{career_name}' not found in DB. Run Admin Sync first!")
            continue
        career_id = career_res.data[0]['career_id']

        # 2. Find the LAST roadmap step for this career
        steps_res = supabase.table('roadmap_step').select('skill_id').eq('career_id', career_id).order('step_order', desc=True).limit(1).execute()
        if not steps_res.data:
            print(f"❌ No skills found for '{career_name}'.")
            continue
        
        last_skill_id = steps_res.data[0]['skill_id']

        # 3. Check if quizzes already exist for this skill
        existing_quizzes = supabase.table('quiz').select('quiz_id').eq('skill_id', last_skill_id).execute()
        if len(existing_quizzes.data) > 0:
            print(f"⏩ Quizzes already exist for {career_name}. Skipping.")
            continue

        # 4. Insert the Quizzes!
        for q in career_data['quizzes']:
            supabase.table('quiz').insert({
                "skill_id": last_skill_id,
                "question": q['question'],
                "options": q['options'],
                "correct_answer": q['correct_answer']
            }).execute()
        
        print(f"✅ Successfully attached {len(career_data['quizzes'])} questions to the final step of {career_name}!")

if __name__ == "__main__":
    upload_quizzes()