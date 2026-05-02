# ============================================================================
# FILE: backend/cron_update.py
# PURPOSE: "The Monthly Refresh" - Updates Roadmaps & Quizzes automatically
#          (With SLOW & SAFE Logic for Free Tier)
# ============================================================================

import requests
import time
import json

# The URL of your running Python Backend
BASE_URL = "http://127.0.0.1:5000"

TARGET_CAREERS = [
    "Software Engineer",
    "Data Scientist",
    "Digital Marketer",
    "Cybersecurity Analyst",
    "Cloud Architect",
    "Product Manager",
    "UI/UX Designer",
    "Blockchain Developer"
]

ADMIN_USER_ID = "957e5a29-46a5-46bd-8a7f-be17a5e2ff4f" 

def make_request_with_retry(url, payload, max_retries=5):
    """
    Tries to make a request. If it hits a 429 (Rate Limit), it waits and retries.
    """
    for attempt in range(max_retries):
        try:
            r = requests.post(url, json=payload)
            
            # If successful, return the response
            if r.status_code == 200:
                return r
            
            # If Rate Limited (429), WAIT and RETRY
            if r.status_code == 429:
                print(f"      ⚠️ Rate Limit Hit! Sleeping for 90 seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(90) # Wait 1.5 minutes to be super safe
                continue 
                
            return r
            
        except Exception as e:
            print(f"      ❌ Network Error: {e}")
            return None
            
    print("      ❌ Max retries exceeded. Moving on.")
    return None

def run_monthly_update():
    print("🚀 STARTING MONTHLY CONTENT REFRESH (SLOW & SAFE MODE)...")
    print("------------------------------------------------")

    for career in TARGET_CAREERS:
        print(f"\nProcessing Career: {career}")
        
        # 1. GENERATE ROADMAP
        roadmap_payload = {
            "career_title": career,
            "user_id": ADMIN_USER_ID
        }
        
        r = make_request_with_retry(f"{BASE_URL}/generate-roadmap", roadmap_payload)
        
        if r and r.status_code == 200:
            data = r.json()
            roadmap_id = data.get('roadmap_id')
            steps = data.get('steps', []) 
            
            print(f"✅ Roadmap Set. ID: {roadmap_id}")
            
            if not steps:
                print("   (No new steps returned. Roadmap might be cached.)")
            
            # 2. LOOP THROUGH STEPS -> GENERATE QUIZZES
            for step in steps:
                skill_name = step['title']
                print(f"   👉 Generating Quiz for skill: {skill_name}...")
                
                # Generate Quiz
                q_payload = {"topic": skill_name}
                q_req = make_request_with_retry(f"{BASE_URL}/generate-quiz", q_payload)
                
                if q_req and q_req.status_code == 200:
                    print(f"      ✅ Quiz Cached.")
                else:
                    print(f"      ❌ Quiz Failed.")
                
                # SLOW SLEEP: 20 seconds between quizzes
                print("      💤 Sleeping 20s...")
                time.sleep(20) 

        else:
            if r:
                print(f"❌ Failed to generate roadmap: {r.text}")
            else:
                print("❌ Request failed completely.")

        # SLEEP BETWEEN CAREERS
        print("   💤 Long sleep between careers (30s)...")
        time.sleep(30)

    print("\n------------------------------------------------")
    print("🎉 MONTHLY UPDATE COMPLETE!")

if __name__ == "__main__":
    run_monthly_update()