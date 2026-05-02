# ============================================================================
# FILE: backend/app.py
# PURPOSE: AI Roadmap (30-Day Versioning) & Quiz Caching
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import google.generativeai as genai
import json
import os
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app) 

# --- CONFIGURATION ---
SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
# SERVICE_ROLE KEY (Bypasses RLS) - Ensure this is your starting-with-eyJ key
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc" 
GEMINI_API_KEY = "AIzaSyCDZJp7WG_sWaYMF05GuiV1pJ1jRb3iEVw" 

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"❌ Configuration Error: {e}")

# ---------------------------------------------------------
# 1. SMART ROADMAP GENERATOR (30-Day Refresh Cycle)
# ---------------------------------------------------------
@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.json
    career_title = data.get('career_title')
    user_id = data.get('user_id')

    if not career_title or not user_id:
        return jsonify({"error": "Missing data"}), 400

    print(f"🚀 Processing: {career_title}")

    # 1. CHECK FOR EXISTING ACTIVE ROADMAP
    existing = supabase.table('ai_roadmaps')\
        .select("*")\
        .eq('title', career_title)\
        .eq('is_active', True)\
        .execute()
    
    current_roadmap = None
    needs_refresh = False

    if existing.data:
        current_roadmap = existing.data[0]
        
        # Parse Created Date
        created_at = datetime.fromisoformat(current_roadmap['created_at'].replace('Z', '+00:00'))
        age = datetime.now(timezone.utc) - created_at
        
        # 30-DAY REFRESH LOGIC
        if age.days >= 30:
            print(f"⚠️ Roadmap is {age.days} days old. Refreshing...")
            needs_refresh = True
        else:
            print(f"✅ Found fresh roadmap ({age.days} days old). Reuse.")
    else:
        print("✨ No roadmap found. Creating first version...")
        needs_refresh = True

    # 2. IF FRESH, REUSE IT (Fast!)
    if current_roadmap and not needs_refresh:
        link_user_to_roadmap(user_id, current_roadmap['id'])
        
        # FETCH STEPS FROM DB (So Cron Script can verify quizzes)
        steps_res = supabase.table('ai_roadmap_steps')\
            .select("*")\
            .eq('roadmap_id', current_roadmap['id'])\
            .order('step_order')\
            .execute()

        return jsonify({
            "success": True, 
            "roadmap_id": current_roadmap['id'],
            "steps": steps_res.data 
        })

    # 3. IF STALE, GENERATE NEW VERSION
    if current_roadmap and needs_refresh:
        supabase.table('ai_roadmaps').update({"is_active": False}).eq('id', current_roadmap['id']).execute()
        new_version = current_roadmap['version'] + 1
    else:
        new_version = 1

    # AI GENERATION (Switching to LITE model for quota safety)
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    
    # ⚡ UPDATED PROMPT: Asks for Resource Title & Type
    prompt = f"""
    Act as a Technical Recruiter in Malaysia. I need a career roadmap for "{career_title}".
    Analyze top job requirements from JobStreet Malaysia, LinkedIn Malaysia, and Hirely.
    Identify exactly 5-10 sequential skills/steps demanded by Malaysian employers for this role.
    
    CRITICAL INSTRUCTION FOR RESOURCES:
    - You must provide a "resource_link" for each step.
    - The resource MUST be FREE or highly affordable (under RM50).
    - PRIORITIZE: Official Documentation, FreeCodeCamp, YouTube Playlists (e.g. Traversy Media, Net Ninja), or free Coursera/EdX audit tracks.
    - AVOID: Expensive bootcamps or paid subscription-only links.
    
    Return ONLY raw JSON (no markdown):
    [
        {{
            "title": "Skill Name (e.g. React.js)",
            "description": "Why this is in demand in Malaysia (mention specific industries).",
            "resource_title": "Title of the video/article",
            "resource_type": "Free", 
            "resource_link": "URL..."
        }}
    ]
    """
    
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        steps = json.loads(clean_text)
        
        # Save NEW Metadata
        res = supabase.table('ai_roadmaps').insert({
            "title": career_title, 
            "description": f"Curated path based on Malaysian market trends (v{new_version})",
            "version": new_version,
            "is_active": True
        }).execute()
        
        new_roadmap_id = res.data[0]['id']

        # Save Steps (⚡ UPDATED: Includes resource_title and resource_type)
        for i, step in enumerate(steps):
            supabase.table('ai_roadmap_steps').insert({
                "roadmap_id": new_roadmap_id,
                "step_order": i + 1,
                "title": step['title'],
                "description": step['description'],
                "resource_link": step['resource_link'],
                "resource_title": step.get('resource_title', 'Recommended Resource'),
                "resource_type": step.get('resource_type', 'Free')
            }).execute()

        print(f"🎉 Generated v{new_version} for {career_title}")
        
        link_user_to_roadmap(user_id, new_roadmap_id)
        
        return jsonify({
            "success": True, 
            "roadmap_id": new_roadmap_id,
            "steps": steps 
        })

    except Exception as e:
        print(f"Error: {e}")
        # Fallback: If AI fails, try to return existing data if available
        if current_roadmap:
            link_user_to_roadmap(user_id, current_roadmap['id'])
            steps_res = supabase.table('ai_roadmap_steps').select("*").eq('roadmap_id', current_roadmap['id']).execute()
            return jsonify({"success": True, "roadmap_id": current_roadmap['id'], "steps": steps_res.data})
            
        return jsonify({"error": str(e)}), 500


def link_user_to_roadmap(user_id, roadmap_id):
    linked = supabase.table('user_ai_roadmaps')\
        .select("*").eq('user_id', user_id).eq('roadmap_id', roadmap_id).execute()
    
    if not linked.data:
        supabase.table('user_ai_roadmaps').insert({
            "user_id": user_id, 
            "roadmap_id": roadmap_id
        }).execute()


# ---------------------------------------------------------
# 2. SMART QUIZ GENERATOR (Cached)
# ---------------------------------------------------------
@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    topic = data.get('topic') 
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    # 1. CHECK CACHE
    existing = supabase.table('ai_quizzes').select("*").eq('topic', topic).execute()
    if existing.data:
        print(f"✅ Found cached quiz for: {topic}")
        return jsonify({"success": True, "quiz": existing.data[0]['questions']})

    print(f"🧠 Generating NEW quiz for: {topic}")
    
    # 2. GENERATE NEW (Switching to LITE model)
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    
    prompt = f"""
    Create a verification quiz for the skill: "{topic}".
    Generate exactly 5 multiple-choice questions.
    
    Return ONLY raw JSON:
    [
        {{
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A" 
        }}
    ]
    """

    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        quiz_data = json.loads(clean_text)

        # 3. SAVE TO DB
        supabase.table('ai_quizzes').insert({
            "topic": topic,
            "questions": quiz_data 
        }).execute()

        return jsonify({"success": True, "quiz": quiz_data})
    except Exception as e:
        print(f"Quiz Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🔥 Server running: 30-Day Versioning + Quiz Caching active...")
    app.run(port=5000, debug=True)