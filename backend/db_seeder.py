import random
import uuid
import sys
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# 🔥 WINDOWS CRASH FIX
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# skill_id 1: Python, 2: React, 3: SQL, 4: Docker, 5: AWS Cloud
# (Note: These IDs must exist in your 'skill' table for the UI to show names)
CORE_SKILLS = [1, 2, 3]
ADVANCED_SKILLS = [4, 5]

def seed_full_test_run():
    print("🚀 Starting FULL 50-Student Test Run Seeder...")
    
    students_created = []

    try:
        # 1. Generate 50 Students
        print("👥 Generating 50 fresh students...")
        for i in range(50):
            u_id = str(uuid.uuid4())
            year = random.choice(['1', '2', '3', '4'])
            name = f"Mock_Student_{random.randint(1000, 9999)}"
            email = f"{name.lower()}@test.edu"

            user_payload = {
                "user_id": u_id,
                "name": name,
                "email": email,
                "role": "student",
                "academic_year": year,
                "programme": "Computer Science"
            }
            
            # This will now work because we dropped the FK constraint
            supabase.table('users').insert(user_payload).execute()
            students_created.append({"id": u_id, "year": year})
            
            if (i+1) % 10 == 0:
                print(f"   - Created {i+1}/50 students")

        # 2. Generate Biased Quiz Results
        print("\n📊 Generating biased quiz results (Heatmap Trends)...")
        for count, student in enumerate(students_created):
            u_id = student['id']
            year = student['year']
            
            for s_id in CORE_SKILLS + ADVANCED_SKILLS:
                score = 0
                if year in ['1', '2']:
                    # Juniors: Good at basics, bad at DevOps
                    score = random.randint(40, 80) if s_id in CORE_SKILLS else random.randint(5, 30)
                else:
                    # Seniors: Strong basics, moderate DevOps
                    score = random.randint(75, 100) if s_id in CORE_SKILLS else random.randint(45, 75)
                
                supabase.table('quiz_result').insert({
                    "user_id": u_id,
                    "skill_id": s_id,
                    "score": score
                }).execute()
            
            if (count+1) % 10 == 0:
                print(f"   - Generated scores for student {count+1}")
        
        # 3. Generate Subjective Feedback for Heatmap Sidebar
        print("\n📝 Adding subjective gaps for Year 3/4 seniors...")
        senior_students = [s for s in students_created if s['year'] in ['3', '4']]
        if senior_students:
            selected = random.sample(senior_students, min(20, len(senior_students)))
            for s in selected:
                supabase.table('student_skill_gaps').insert({
                    "user_id": s['id'],
                    "skill_name": "Cloud Deployment (AWS)",
                    "category": "Technical",
                    "reason": "Student reports minimal production deployment experience.",
                    "status": "open"
                }).execute()

        print("\n✅ SEEDING COMPLETE: 50 students and their results are now in the DB.")
        print("   Refresh your Heatmap UI to see the full data visualization!")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    seed_full_test_run()
