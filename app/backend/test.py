import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback
import time

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY_1")

if not api_key:
    print("❌ GOOGLE_API_KEY not found in .env file.")
    exit(1)

print("🔑 Using GOOGLE_API_KEY:", api_key[:4] + "..." + api_key[-4:])

try:
    genai.configure(api_key=api_key)

    # Step 1: List available models
    print("\n📦 Listing available models...")
    time.sleep(0.5)
    models = genai.list_models()
    if not models:
        print("⚠️ No models available with this API key.")
    else:
        for m in models:
            print("🔹", m.name)
    time.sleep(0.5)

    # Step 2: Try Gemini-pro
    print("\n🧪 Sending test prompt to Gemini...")
    time.sleep(1)

    model = genai.GenerativeModel("models/gemini-1.5-flash")


    response = model.generate_content("Say hello world.")
    
    time.sleep(1)
    print("\n✅ Gemini response:", response.text)

except Exception as e:
    print("\n❌ ERROR: Failed to use Gemini model")
    print("📌 Exception Type:", type(e).__name__)
    print("📌 Exception Message:", str(e))
    print("\n🔍 Full Traceback:")
    traceback.print_exc()
