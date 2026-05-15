# ============================================================================
# FILE: backend/background_generator.py
# PURPOSE: Rate-Limit-Safe AI Content Generator (Powered by Groq / Llama 3)
# ============================================================================

import sys
import json
import time
from supabase import create_client, Client
from groq import Groq

# 🔥 WINDOWS CRASH FIX: Forces the terminal to accept all characters/emojis
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 

# ⚡ PASTE YOUR NEW GROQ API KEY HERE:
GROQ_API_KEY = "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" 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = Groq(api_key=GROQ_API_KEY)

TARGET_CAREERS = [
    "Software Engineer", 
    "Data Scientist", 
    "Cybersecurity Analyst",
    "Cloud Architect",
    "AI / Machine Learning Engineer",
    "DevOps Engineer",
    "Full Stack Web Developer",
    "Mobile App Developer",
    "UI/UX Designer",
    "IT Product Manager"
]

def clean_json(raw_text):
    text = raw_text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()

def run_slow_generation():
    print("[BACKGROUND WORKER] Starting Llama 3 generation process via Groq...")

    for career_name in TARGET_CAREERS:
        existing = supabase.table('career').select('career_id').eq('career_name', career_name).execute()
        if existing.data:
            print(f"[SKIP] '{career_name}' already exists.")
            continue

        print(f"[WAIT] Generating data for: {career_name}...")
        
        prompt = f"""You are an expert curriculum designer. 
        Create a 7-step learning roadmap for a '{career_name}'.
        Return ONLY a valid JSON object matching this exact schema:
        {{
            "description": "Short description of the career",
            "steps": [
                {{
                    "skill_name": "Name of skill",
                    "category": "Technical",
                    "description": "Why learn this",
                    "resource": {{"title": "Course Name", "provider": "YouTube", "url": "https://youtube.com"}}
                }}
            ]
        }}"""

        try:
            # ⚡ GENERATE CONTENT USING GROQ (Lightning Fast!)
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama3-8b-8192",
                response_format={"type": "json_object"}, # Forces perfect JSON
            )
            
            # Extract the text from Groq's response
            response_text = chat_completion.choices[0].message.content
            data = json.loads(clean_json(response_text))

            # Database Insertion
            career_res = supabase.table('career').insert({
                "career_name": career_name, "description": data['description']
            }).execute()
            career_id = career_res.data[0]['career_id']

            for i, step in enumerate(data['steps']):
                skill_res = supabase.table('skill').insert({
                    "skill_name": step['skill_name'], 
                    "skill_category": step['category'], 
                    "description": step['description']
                }).execute()
                skill_id = skill_res.data[0]['skill_id']

                supabase.table('roadmap_step').insert({
                    "career_id": career_id, 
                    "skill_id": skill_id, 
                    "step_order": i + 1
                }).execute()

                supabase.table('learning_resource').insert({
                    "skill_id": skill_id, 
                    "title": step['resource']['title'], 
                    "provider": step['resource']['provider'], 
                    "url": step['resource']['url'], 
                    "cost_type": "free"
                }).execute()

            print(f"[SUCCESS] Generated and saved roadmap for: {career_name}")
            print("[SLEEP] Sleeping for 5 seconds to protect API limits...")
            time.sleep(5) # Groq is generous, we only need to sleep for 5 seconds!

        except Exception as e:
            print(f"[ERROR] Error generating {career_name}: {e}")

    print("[DONE] Background Generation Complete!")

if __name__ == "__main__":
    run_slow_generation()