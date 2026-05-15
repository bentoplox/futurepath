# ============================================================================
# FILE: backend/background_generator.py
# PURPOSE: Rate-Limit-Safe AI Content Generator (Powered by Groq / Llama 3)
# ============================================================================

import os
import sys
import json
import time
from supabase import create_client, Client
from openai import OpenAI
from dotenv import load_dotenv

# LangChain / Gemini / Groq Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

# 🔥 WINDOWS CRASH FIX: Forces the terminal to accept all characters/emojis
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 

# 🛠️ PROVIDER TOGGLE: "openrouter", "gemini", or "groq"
AI_PROVIDER = "groq" 

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.0-flash" # Gemini 2.0 Flash is the latest stable high-speed model

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Clients
def get_ai_response(prompt):
    if AI_PROVIDER == "openrouter":
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=OPENROUTER_MODEL,
        )
        return chat_completion.choices[0].message.content

    elif AI_PROVIDER == "gemini":
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GEMINI_API_KEY,
            temperature=0.7
        )
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content

    elif AI_PROVIDER == "groq":
        llm = ChatGroq(
            model=GROQ_MODEL,
            groq_api_key=GROQ_API_KEY,
            temperature=0.7
        )
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content

    else:
        raise ValueError(f"Unknown AI_PROVIDER: {AI_PROVIDER}")

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
    if AI_PROVIDER == "openrouter":
        model_name = OPENROUTER_MODEL
    elif AI_PROVIDER == "gemini":
        model_name = GEMINI_MODEL
    elif AI_PROVIDER == "groq":
        model_name = GROQ_MODEL
    else:
        model_name = "unknown"

    print(f"[BACKGROUND WORKER] Starting generation process via {AI_PROVIDER} ({model_name})...")

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
            # ⚡ GENERATE CONTENT USING SELECTED PROVIDER
            response_text = get_ai_response(prompt)
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
            time.sleep(5) 

        except Exception as e:
            print(f"[ERROR] Error generating {career_name}: {e}")

    print("[DONE] Background Generation Complete!")

if __name__ == "__main__":
    run_slow_generation()