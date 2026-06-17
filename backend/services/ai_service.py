import os
from openai import OpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

AI_PROVIDER = os.getenv("AI_PROVIDER", "groq") # "openai", "gemini", or "groq"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

def clean_json(raw_text):
    text = raw_text.strip()
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()

def get_ai_response(prompt):
    print(f"[AI] Calling {AI_PROVIDER} with prompt: {prompt[:100]}...")
    try:
        if AI_PROVIDER == "openai":
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content

        elif AI_PROVIDER == "gemini":
            llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL,
                google_api_key=os.getenv("GEMINI_API_KEY")
            )
            res = llm.invoke(prompt)
            return res.content

        elif AI_PROVIDER == "groq":
            llm = ChatGroq(
                model=GROQ_MODEL,
                groq_api_key=os.getenv("GROQ_API_KEY")
            )
            res = llm.invoke(prompt)
            return res.content
    except Exception as e:
        print(f"[AI ERROR] {AI_PROVIDER} failure: {str(e)}")
        raise e
    
    return "{}"
