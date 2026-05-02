import google.generativeai as genai
import os

# PASTE YOUR NEW KEY HERE
TEST_KEY = "AIzaSyCDZJp7WG_sWaYMF05GuiV1pJ1jRb3iEVw"

genai.configure(api_key=TEST_KEY)

print("Attempting to list models...")
try:
    models = genai.list_models()
    found = False
    for m in models:
        print(f"Found model: {m.name}")
        if 'gemini-1.5-flash' in m.name:
            found = True
    
    if found:
        print("\n✅ SUCCESS! This key can access gemini-1.5-flash.")
    else:
        print("\n❌ Key works, but gemini-1.5-flash is NOT in the list.")
        
except Exception as e:
    print(f"\n❌ ERROR: Your key is invalid. Details: {e}")