from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = "https://smgjboifsheewiyeupbo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0MDc3OSwiZXhwIjoyMDgyNjE2Nzc5fQ.ySJgBXFvZk5xxYzHqR7NfPXrRVGaR-8HrzC_tojuHhc"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("--- VERIFIED RESOURCES ---")
res = supabase.table('verified_resources').select('concept_tag').execute()
for r in res.data:
    print(f"Tag: {r['concept_tag']}")

print("\n--- RECENTLY GENERATED SKILLS ---")
res2 = supabase.table('skill').select('skill_name, concept_tag').order('skill_id', desc=True).limit(20).execute()
for s in res2.data:
    print(f"Skill: {s['skill_name']} | Tag: {s['concept_tag']}")
