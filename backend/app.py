# ============================================================================
# FILE: backend/app.py
# PURPOSE: AI Roadmap + Quizzes using the NEW Google GenAI SDK (Gemini 2.0)
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from google import genai
from google.genai import types
import json
from datetime import datetime, timezone
from duckduckgo_search import DDGS 

app = Flask(__name__)
CORS(app) 

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 
GEMINI_API_KEY = "AIzaSyD56MtTPTVhfBKx6f4ktouSZbP58yc25NE"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Initialize the NEW official Gemini Client
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    print("✅ Supabase and Gemini 2.0 API Initialized Successfully!")
except Exception as e:
    print(f"❌ Configuration Error: {e}")

# --- HELPER FUNCTIONS ---

def clean_json_response(raw_text):
    """Safely removes markdown backticks if Gemini accidentally includes them."""
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        lines = raw_text.split('\n')
        if lines[0].startswith("```"): lines = lines[1:]
        if lines[-1].startswith("```"): lines = lines[:-1]
        raw_text = '\n'.join(lines).strip()
    return raw_text

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
        "link": f"[https://duckduckgo.com/?q=](https://duckduckgo.com/?q=){skill_name.replace(' ', '+')}+free+course+with+certificate",
        "type": "Web Search"
    }

def internal_generate_quiz(topic):
    """Generates a quiz using Gemini 2.0 and saves it to Supabase."""
    existing = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    if existing.data:
        print(f"⏩ Quiz for '{topic}' already cached. Skipping.")
        return

    print(f"🧠 [Gemini] Generating quiz for: {topic}...")
    
    prompt = f"""Create a 5-question multiple-choice quiz for the technical skill: "{topic}".
    Return ONLY a valid JSON array matching this exact schema:
    [ {{"question": "string", "options": ["A", "B", "C", "D"], "correct_answer": "Exact string of correct option"}} ]"""

    try:
        # ⚡ Upgraded to gemini-2.0-flash to fix the 404 error
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Clean markdown if present and parse
        clean_text = clean_json_response(response.text)
        quiz_data = json.loads(clean_text)

        supabase.table('ai_quizzes').insert({"topic": topic, "questions": quiz_data}).execute()
        print(f"✅ Quiz for '{topic}' saved.")
    except Exception as e:
        print(f"❌ Quiz generation failed for {topic}: {e}")

# ---------------------------------------------------------
# 1. ROADMAP GENERATOR 
# ---------------------------------------------------------
@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.json
    career_title = data.get('career_title')
    user_id = data.get('user_id')

    if not career_title or not user_id:
        return jsonify({"error": "Missing data"}), 400

    print(f"🚀 STARTING ROADMAP: {career_title}")

    # --- CACHING ROADMAPS (30 Days) ---
    existing = supabase.table('ai_roadmaps').select("*").eq('title', career_title).eq('is_active', True).execute()
    
    current_roadmap = None
    if existing.data:
        current_roadmap = existing.data[0]
        created_at = datetime.fromisoformat(current_roadmap['created_at'].replace('Z', '+00:00'))
        if (datetime.now(timezone.utc) - created_at).days < 30:
            print("✅ Found fresh cached roadmap in DB. Linking user...")
            link_user_to_roadmap(user_id, current_roadmap['id'])
            steps_res = supabase.table('ai_roadmap_steps').select("*").eq('roadmap_id', current_roadmap['id']).order('step_order').execute()
            return jsonify({"success": True, "roadmap_id": current_roadmap['id'], "steps": steps_res.data})

    # --- GEMINI GENERATION ---
    prompt = f"""You are a Technical Recruiter. Create a career roadmap for '{career_title}'. Identify 5 sequential skills needed to master this role. 
    Return ONLY a valid JSON array matching this exact schema:
    [ {{"title": "Skill Name", "description": "Short explanation of why it is needed"}} ]"""
    
    try:
        print("🤖 [Gemini] Thinking of roadmap steps...")
        
        # ⚡ Upgraded to gemini-2.0-flash to fix the 404 error
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # ⚡ Added robust markdown cleaner to prevent 500 crashes
        clean_text = clean_json_response(response.text)
        steps = json.loads(clean_text)
        
        # Save Roadmap Metadata
        new_version = (current_roadmap['version'] + 1) if current_roadmap else 1
        if current_roadmap:
            supabase.table('ai_roadmaps').update({"is_active": False}).eq('id', current_roadmap['id']).execute()
        
        res = supabase.table('ai_roadmaps').insert({
            "title": career_title, 
            "description": f"Curated industry learning path v{new_version}", 
            "version": new_version, 
            "is_active": True
        }).execute()
        new_id = res.data[0]['id']

        # Loop through steps to find resources and pre-gen quizzes
        for i, step in enumerate(steps):
            print(f"🌐 [Web] Finding resource for: {step['title']}")
            res_data = get_real_certificate_resource(step['title'])

            supabase.table('ai_roadmap_steps').insert({
                "roadmap_id": new_id, 
                "step_order": i + 1, 
                "title": step['title'],
                "description": step['description'], 
                "resource_link": res_data['link'],
                "resource_title": res_data['title'], 
                "resource_type": res_data['type']
            }).execute()

            internal_generate_quiz(step['title'])

        link_user_to_roadmap(user_id, new_id)
        
        final_steps = supabase.table('ai_roadmap_steps').select("*").eq('roadmap_id', new_id).order('step_order').execute()
        print(f"🎉 Roadmap for {career_title} is FULLY complete!")
        return jsonify({"success": True, "roadmap_id": new_id, "steps": final_steps.data})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

def link_user_to_roadmap(user_id, roadmap_id):
    linked = supabase.table('user_ai_roadmaps').select("*").eq('user_id', user_id).eq('roadmap_id', roadmap_id).execute()
    if not linked.data:
        supabase.table('user_ai_roadmaps').insert({"user_id": user_id, "roadmap_id": roadmap_id}).execute()

# ---------------------------------------------------------
# 2. QUIZ LOADER 
# ---------------------------------------------------------
@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    topic = request.json.get('topic') 
    if not topic: return jsonify({"error": "Topic required"}), 400

    existing = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    if existing.data:
        return jsonify({"success": True, "quiz": existing.data[0]['questions']})

    # If not pre-generated, generate it on the fly
    internal_generate_quiz(topic)
    updated = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    
    if not updated.data:
        return jsonify({"success": False, "error": "Failed to generate quiz."}), 500

    return jsonify({"success": True, "quiz": updated.data[0]['questions']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)