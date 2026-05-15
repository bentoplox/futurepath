# ============================================================================
# FILE: backend/admin_seeder.py
# PURPOSE: Admin script to populate normalized database (FR5.1)
# ============================================================================

import json
from supabase import create_client, Client

SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
# Use your Supabase Service Role Key here to bypass Row Level Security for admin tasks
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def populate_database_from_json(json_file_path):
    print(f" Admin Mode: Populating database from {json_file_path}...")
    
    with open(json_file_path, 'r') as file:
        data = json.load(file)

    for career_data in data:
        career_name = career_data['career_name']
        print(f"\n Processing Career: {career_name}")

        # 1. Check/Insert Career
        career_res = supabase.table('career').select('career_id').eq('career_name', career_name).execute()
        if career_res.data:
            career_id = career_res.data[0]['career_id']
            print(f"    Career exists (ID: {career_id}). Skipping insertion.")
        else:
            new_career = supabase.table('career').insert({
                "career_name": career_name,
                "description": career_data['description']
            }).execute()
            career_id = new_career.data[0]['career_id']
            print(f"    Career inserted (ID: {career_id})")

        # 2. Process Skills, Roadmap Steps, Resources, and Quizzes
        for i, step_data in enumerate(career_data['steps']):
            skill_name = step_data['skill_name']
            
            # Insert Skill
            new_skill = supabase.table('skill').insert({
                "skill_name": skill_name,
                "skill_category": step_data.get('category', 'Technical'),
                "description": step_data['description']
            }).execute()
            skill_id = new_skill.data[0]['skill_id']

            # Link Skill to Career via Roadmap_Step
            supabase.table('roadmap_step').insert({
                "career_id": career_id,
                "skill_id": skill_id,
                "step_order": i + 1
            }).execute()

            # Insert Learning Resource
            supabase.table('learning_resource').insert({
                "skill_id": skill_id,
                "title": step_data['resource']['title'],
                "provider": step_data['resource']['provider'],
                "url": step_data['resource']['url'],
                "cost_type": "free"
            }).execute()

            # Insert Quizzes for this Skill (FR4.5)
            if 'quizzes' in step_data:
                for q in step_data['quizzes']:
                    supabase.table('quiz').insert({
                        "skill_id": skill_id,
                        "question": q['question'],
                        "options": q['options'], # Supabase handles JSONB arrays automatically
                        "correct_answer": q['correct_answer']
                    }).execute()
            
            print(f"    Mapped Step {i+1}: {skill_name} + Resources & Quizzes")

if __name__ == "__main__":
    # Ensure you have a master_content.json file formatted to match this loop
    populate_database_from_json('master_content.json')