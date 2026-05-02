# ============================================================================
# FILE: backend/app.py
# PURPOSE: AI Roadmap (30-Day Versioning) + Automated Quiz Pre-generation
# MODEL: Local Llama 3 (RTX 3060 Optimized)
# SEARCH: DuckDuckGo Certificate Search (Live Web)
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from llama_cpp import Llama 
import json
import os
from datetime import datetime, timedelta, timezone
from threading import Lock 
from duckduckgo_search import DDGS 

app = Flask(__name__)
CORS(app) 

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 

# --- LOCAL AI CONFIGURATION ---
MODEL_PATH = "./model/meta-llama.gguf" 

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("--- 🤖 INITIALIZING LOCAL AI ---")
    llm = Llama(
        model_path=MODEL_PATH,
        n_gpu_layers=-1, # Uses your RTX 3060
        n_ctx=2048,      # Context window
        verbose=False    
    )
    print("✅ Local Model Loaded Successfully!")
    
    # Thread Lock: Prevents the GPU from crashing if 2 people use the app at once
    model_lock = Lock()

except Exception as e:
    print(f"❌ Configuration Error: {e}")

# --- HELPER FUNCTIONS ---

def extract_json_array(text):
    """Cleans AI output to ensure we only get the JSON data."""
    try:
        start = text.find('[')
        end = text.rfind(']') + 1
        if start != -1 and end != 0:
            return text[start:end]
        return text
    except Exception:
        return text

def get_real_certificate_resource(skill_name):
    """Searches the live web for a FREE course with a certificate."""
    try:
        search_query = f"{skill_name} free course with certificate"
        results = DDGS().text(search_query, max_results=1)
        if results:
            course = results[0]
            return {
                "title": course['title'], 
                "link": course['href'], 
                "type": "Free Certification Course"
            }
    except Exception:
        pass
    return {
        "title": f"Search for {skill_name} Free Certificate",
        "link": f"https://duckduckgo.com/?q={skill_name.replace(' ', '+')}+free+course+with+certificate",
        "type": "Web Search"
    }

def internal_generate_quiz(topic):
    """Generates a quiz for a skill and saves it to Supabase."""
    # check if we already have this quiz
    existing = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    if existing.data:
        print(f"⏩ Quiz for '{topic}' already exists. Skipping generation.")
        return

    print(f"🧠 [AI] Generating quiz for: {topic}...")
    
    system_prompt = "You are an expert quiz generator. Return ONLY a raw JSON array of 5 questions. No chat."
    user_prompt = f"""Create a 5-question multiple-choice quiz for: "{topic}".
    Format: [ {{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}} ]"""

    try:
        with model_lock:
            response = llm.create_chat_completion(
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                max_tokens=800,
                temperature=0.2
            )
        
        raw_text = response['choices'][0]['message']['content']
        quiz_data = json.loads(extract_json_array(raw_text))

        supabase.table('ai_quizzes').insert({"topic": topic, "questions": quiz_data}).execute()
        print(f"✅ Quiz for '{topic}' saved.")
    except Exception as e:
        print(f"❌ Quiz Pre-gen failed for {topic}: {e}")

# ---------------------------------------------------------
# 1. ROADMAP GENERATOR (Generates everything at once)
# ---------------------------------------------------------
@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.json
    career_title = data.get('career_title')
    user_id = data.get('user_id')

    if not career_title or not user_id:
        return jsonify({"error": "Missing data"}), 400

    print(f"🚀 STARTING ROADMAP: {career_title}")

    # A. CHECK VERSIONING (30 Days)
    existing = supabase.table('ai_roadmaps').select("*").eq('title', career_title).eq('is_active', True).execute()
    
    current_roadmap = None
    if existing.data:
        current_roadmap = existing.data[0]
        created_at = datetime.fromisoformat(current_roadmap['created_at'].replace('Z', '+00:00'))
        if (datetime.now(timezone.utc) - created_at).days < 30:
            print("✅ Found fresh roadmap in DB. Linking user...")
            link_user_to_roadmap(user_id, current_roadmap['id'])
            steps_res = supabase.table('ai_roadmap_steps').select("*").eq('roadmap_id', current_roadmap['id']).order('step_order').execute()
            return jsonify({"success": True, "roadmap_id": current_roadmap['id'], "steps": steps_res.data})

    # B. GENERATE SKILLS (Local AI)
    system_prompt = "You are a Technical Recruiter in Malaysia. Return ONLY a raw JSON array of 5 skills."
    user_prompt = f"Create a career roadmap for '{career_title}'. Identify 5 sequential skills. Format: [{{'title': '...', 'description': '...'}}]"
    
    try:
        print("🤖 [AI] Thinking of roadmap steps...")
        with model_lock:
            response = llm.create_chat_completion(
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                max_tokens=800,
                temperature=0.3
            )
        
        steps = json.loads(extract_json_array(response['choices'][0]['message']['content']))
        
        # Save Roadmap Metadata
        new_version = (current_roadmap['version'] + 1) if current_roadmap else 1
        if current_roadmap:
            supabase.table('ai_roadmaps').update({"is_active": False}).eq('id', current_roadmap['id']).execute()
        
        res = supabase.table('ai_roadmaps').insert({
            "title": career_title, 
            "description": f"Market path v{new_version}", 
            "version": new_version, 
            "is_active": True
        }).execute()
        new_id = res.data[0]['id']

        # C. THE BIG LOOP: Resources + Quizzes
        for i, step in enumerate(steps):
            # 1. Search Web for Certificate
            print(f"🌐 [Web] Finding certificate for: {step['title']}")
            res_data = get_real_certificate_resource(step['title'])

            # 2. Save Step to DB
            supabase.table('ai_roadmap_steps').insert({
                "roadmap_id": new_id, 
                "step_order": i + 1, 
                "title": step['title'],
                "description": step['description'], 
                "resource_link": res_data['link'],
                "resource_title": res_data['title'], 
                "resource_type": res_data['type']
            }).execute()

            # 3. PRE-GENERATE QUIZ (The "Instant" Feature)
            internal_generate_quiz(step['title'])

        link_user_to_roadmap(user_id, new_id)
        
        # Return final data to frontend
        final_steps = supabase.table('ai_roadmap_steps').select("*").eq('roadmap_id', new_id).order('step_order').execute()
        print(f"🎉 Roadmap for {career_title} is FULLY complete!")
        return jsonify({"success": True, "roadmap_id": new_id, "steps": final_steps.data})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": "Failed to build full roadmap system."}), 500

def link_user_to_roadmap(user_id, roadmap_id):
    linked = supabase.table('user_ai_roadmaps').select("*").eq('user_id', user_id).eq('roadmap_id', roadmap_id).execute()
    if not linked.data:
        supabase.table('user_ai_roadmaps').insert({"user_id": user_id, "roadmap_id": roadmap_id}).execute()

# ---------------------------------------------------------
# 2. QUIZ LOADER (Instant)
# ---------------------------------------------------------
@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    topic = request.json.get('topic') 
    if not topic: return jsonify({"error": "Topic required"}), 400

    # Because we pre-generate during roadmap creation, this is almost always instant
    existing = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    
    if existing.data:
        print(f"⚡ Instant Load: Quiz for '{topic}' retrieved from DB.")
        return jsonify({"success": True, "quiz": existing.data[0]['questions']})

    # Fallback if it wasn't pre-generated
    internal_generate_quiz(topic)
    updated = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    return jsonify({"success": True, "quiz": updated.data[0]['questions']})

if __name__ == '__main__':
    # debug=False is important so the local AI model doesn't load twice!
    app.run(host='0.0.0.0', port=5000, debug=False)