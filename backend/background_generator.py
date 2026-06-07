# ============================================================================
# FILE: backend/background_generator.py
# PURPOSE: Rate-Limit-Safe AI Content Generator (Powered by Groq / Llama 3)
# ============================================================================

import os
import sys
import json
import time
import requests
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
GEMINI_MODEL = "gemini-2.0-flash" 

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def is_url_working(url):
    """Simple check to see if a URL is reachable."""
    try:
        # We use a short timeout and only headers to keep it fast
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code < 400
    except:
        try:
            # Some sites block HEAD requests, try a small GET
            response = requests.get(url, timeout=5, stream=True)
            return response.status_code < 400
        except:
            return False

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
    "Data Scientist"
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

    print(f"[PILOT PHASE] Starting generation for 2 core careers via {AI_PROVIDER}...")

    for career_name in TARGET_CAREERS:
        # Check if career exists and clean up stale data
        existing_career = supabase.table('career').select('career_id').eq('career_name', career_name).execute()
        if existing_career.data:
            c_id = existing_career.data[0]['career_id']
            print(f"[CLEANUP] Removing stale data for {career_name} (ID: {c_id})...")
            
            # ⚡ MANUAL CASCADE: Delete dependencies in order
            try:
                # 1. Get roadmap steps for this career
                steps_res = supabase.table('roadmap_step').select('step_id, skill_id').eq('career_id', c_id).execute()
                step_ids = [s['step_id'] for s in steps_res.data]
                skill_ids = [s['skill_id'] for s in steps_res.data]

                # 2. Delete progress records and roadmaps
                if step_ids:
                    supabase.table('progress_record').delete().in_('step_id', step_ids).execute()
                supabase.table('roadmap').delete().eq('career_id', c_id).execute()

                # 3. Delete steps
                supabase.table('roadmap_step').delete().eq('career_id', c_id).execute()

                # 4. Delete associated skills and their resources/quizzes
                if skill_ids:
                    supabase.table('learning_resource').delete().in_('skill_id', skill_ids).execute()
                    supabase.table('quiz').delete().in_('skill_id', skill_ids).execute()
                    supabase.table('quiz_result').delete().in_('skill_id', skill_ids).execute()
                    supabase.table('skill').delete().in_('skill_id', skill_ids).execute()

                # 5. Finally, delete the career
                supabase.table('career').delete().eq('career_id', c_id).execute()
                print(f"[CLEANUP] Stale data for {career_name} cleared successfully.")
            except Exception as e:
                print(f"[WARN] Cleanup partially failed for {career_name}: {e}")
                # We continue anyway to try and insert new data

        # ⚡ NEW: FETCH AVAILABLE VERIFIED TAGS TO PREVENT MISMATCH
        verified_tags_res = supabase.table('verified_resources').select('concept_tag').execute()
        available_tags = list(set([r['concept_tag'] for r in verified_tags_res.data]))
        tags_list_str = ", ".join(available_tags)

        print(f"[WAIT] Architecting roadmap for: {career_name}...")
        
        prompt = f"""You are a Senior Curriculum Engineer. 
        Create a comprehensive learning roadmap for a '{career_name}'.
        
        RULES:
        1. STEPS: Provide all CRUCIAL technical steps required for this role (avoid filler, focus on industry relevance).
        2. SKILLS: For each step, provide a 'concept_tag' (e.g., 'react-hooks', 'python-basics') for resource mapping.
           - IMPORTANT: We have verified high-quality resources for these specific tags: [{tags_list_str}].
           - If a skill you generate matches one of these tags, you MUST use the EXACT tag from the list.
        3. QUIZZES: Provide 3 MCQs per skill. 
           - Assign each a 'difficulty': Beginner, Intermediate, or Advanced.
           - EACH question MUST have EXACTLY 4 options.
           - CRITICAL: The 'correct_answer' MUST be a verbatim string match to one of the 'options'.
        
        Return ONLY valid JSON matching this exact schema:
        {{
            "description": "Comprehensive career summary",
            "steps": [
                {{
                    "skill_name": "Name of skill",
                    "concept_tag": "slug-style-tag",
                    "category": "Technical",
                    "description": "Industry context",
                    "quizzes": [
                        {{
                            "question": "Question text",
                            "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
                            "correct_answer": "Choice 1",
                            "difficulty": "Intermediate"
                        }}
                    ]
                }}
            ]
        }}"""

        try:
            # ⚡ GENERATE CONTENT
            response_text = get_ai_response(prompt)
            data = json.loads(clean_json(response_text))

            # 1. Insert Career
            career_res = supabase.table('career').insert({
                "career_name": career_name, "description": data['description']
            }).execute()
            career_id = career_res.data[0]['career_id']

            for i, step in enumerate(data['steps']):
                # 2. Insert Skill
                skill_res = supabase.table('skill').insert({
                    "skill_name": step['skill_name'], 
                    "skill_category": step['category'], 
                    "description": step['description'],
                    "concept_tag": step.get('concept_tag')
                }).execute()
                skill_id = skill_res.data[0]['skill_id']

                # 3. Link Step
                supabase.table('roadmap_step').insert({
                    "career_id": career_id, "skill_id": skill_id, "step_order": i + 1
                }).execute()

                # 4. Requirement A: Map Verified Resources
                tag = step.get('concept_tag')
                verified = supabase.table('verified_resources').select('*').eq('concept_tag', tag).execute()
                
                if verified.data:
                    for res in verified.data:
                        supabase.table('learning_resource').insert({
                            "skill_id": skill_id, "title": res['title'], 
                            "provider": res['provider'], "url": res['url'], "cost_type": "free"
                        }).execute()
                else:
                    fallback_url = f"https://www.youtube.com/results?search_query={step['skill_name'].replace(' ', '+')}+tutorial"
                    supabase.table('learning_resource').insert({
                        "skill_id": skill_id, "title": f"Intro to {step['skill_name']}", 
                        "provider": "YouTube", "url": fallback_url, "cost_type": "free"
                    }).execute()

                # 5. Requirement B: Validated Quizzes
                import random as py_random
                for q in step.get('quizzes', []):
                    # AI-Logic Validation: Ensure the answer exists in choices
                    if q['correct_answer'] not in q['options']:
                        print(f"[WARN] Quiz Hallucination detected for {step['skill_name']}. Fixing...")
                        q['correct_answer'] = q['options'][0]

                    # ⚡ NEW: Randomize Option Order (A, B, C, D)
                    # This ensures the correct answer isn't always the first option
                    py_random.shuffle(q['options'])

                    supabase.table('quiz').insert({
                        "skill_id": skill_id,
                        "question": q['question'],
                        "options": q['options'],
                        "correct_answer": q['correct_answer'],
                        "difficulty": q.get('difficulty', 'Beginner')
                    }).execute()

            print(f"[SUCCESS] {career_name} roadmap and verified quizzes stored.")
            time.sleep(2) 

        except Exception as e:
            print(f"[ERROR] Generation failed for {career_name}: {e}")

            print(f"[SUCCESS] Generated and saved roadmap and {len(data['steps'])*3} quizzes for: {career_name}")
            print("[SLEEP] Sleeping for 5 seconds to protect API limits...")
            time.sleep(5) 

        except Exception as e:
            print(f"[ERROR] Error generating {career_name}: {e}")

    print("[DONE] Background Generation Complete!")

if __name__ == "__main__":
    run_slow_generation()