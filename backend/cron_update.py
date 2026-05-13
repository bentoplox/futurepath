# ============================================================================
# FILE: backend/cron_update.py
# PURPOSE: Monthly Refresh - Optimized for Gemini 1.5/2.0 Rate Limits
# ============================================================================

import requests
import time

BASE_URL = "http://127.0.0.1:5000"

TARGET_CAREERS = [
    "Software Engineer", "Data Scientist", "Digital Marketer",
    "Cybersecurity Analyst", "Cloud Architect", "Product Manager",
    "UI/UX Designer", "Blockchain Developer"
]

ADMIN_USER_ID = "957e5a29-46a5-46bd-8a7f-be17a5e2ff4f" 

def make_request_with_retry(url, payload, max_retries=3):
    for attempt in range(max_retries):
        try:
            r = requests.post(url, json=payload)
            if r.status_code == 200:
                return r
            
            # If we hit a rate limit (429) OR the Flask server crashes because Gemini rejected the request (500)
            if r.status_code == 429 or r.status_code == 500: 
                print(f"      ⏳ Rate Limit / Server Error Hit! Sleeping for 65 seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(65) # Wait for the Google penalty minute to expire
                continue 
                
            return r
        except Exception as e:
            print(f"      ❌ Network Error: {e}")
            # If the backend is completely offline, wait a bit before trying again
            time.sleep(10) 
            return None
    return None

def run_monthly_update():
    print("🚀 STARTING GEMINI CONTENT REFRESH...")
    print("------------------------------------------------")

    for career in TARGET_CAREERS:
        print(f"\nProcessing Career: {career}")
        
        # 1. Generate Roadmap
        roadmap_payload = {"career_title": career, "user_id": ADMIN_USER_ID}
        r = make_request_with_retry(f"{BASE_URL}/generate-roadmap", roadmap_payload)
        
        if r and r.status_code == 200:
            print(f"✅ Roadmap Set.")
            steps = r.json().get('steps', []) 
            
            # ⚡ Prevent burst request right after roadmap generation
            time.sleep(6) 
            
            # 2. Generate Quizzes (Paced to max 10 requests per minute)
            for step in steps:
                skill_name = step['title']
                print(f"  👉 Generating Quiz for: {skill_name}...")
                
                q_payload = {"topic": skill_name}
                q_req = make_request_with_retry(f"{BASE_URL}/generate-quiz", q_payload)
                
                if q_req and q_req.status_code == 200:
                    print(f"      ✅ Quiz Cached.")
                else:
                    print(f"      ❌ Quiz Failed.")
                
                # ⚡ 6 seconds ensures we only do 10 requests per minute (Limit is 15)
                time.sleep(6) 
        else:
            print(f"❌ Failed to generate roadmap.")

    print("\n------------------------------------------------")
    print("🎉 UPDATE COMPLETE!")

if __name__ == "__main__":
    run_monthly_update()