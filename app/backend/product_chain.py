import google.generativeai as genai
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import os
import time
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY_1") or "your_key_here"
genai.configure(api_key=GOOGLE_API_KEY)

def recommend_product(user_input, product_catalog):
    trimmed_catalog = [
        {
            "product_id": item["product_id"],
            "product_name": item["product_name"]
        }
        for item in product_catalog
    ]

    prompt_template = PromptTemplate.from_template("""
You are a helpful Walmart shopping assistant.

User says: "{user_input}"

Catalog (subset):
{catalog}

Your task is to:
- Recommend the closest matching product based on the user's intent.
- Give up to 2 alternative suggestions from the catalog.
- Respond in JSON format:
{{
  "recommendation": {{
    "product_id": str,
    "description": str
  }},
  "alternatives": [
    {{
      "product_id": str,
      "description": str
    }},
    ...
  ]
}}
""")

    prompt = prompt_template.format(
        user_input=user_input,
        catalog=json.dumps(trimmed_catalog[:100])
    )

    model = genai.GenerativeModel("models/gemini-1.5-flash")

    for _ in range(3):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()

            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()

            result = json.loads(text)

            if (
                not result.get("recommendation")
                or result["recommendation"].get("product_id") is None
            ):
                return {
                    "recommendation": {
                        "product_id": None,
                        "description": "😔 Sorry, this product is not available. Try searching for something else."
                    },
                    "alternatives": []
                }

            return result

        except Exception as e:
            if "429" in str(e):
                print("🔁 Rate limit hit. Retrying in 10s...")
                time.sleep(10)
            else:
                return {
                    "response": {
                        "error": str(e),
                        "raw_response": response.text if 'response' in locals() else "No response"
                    }
                }

    return {
        "response": {
            "error": "Retries exhausted due to quota issues.",
            "raw_response": "No successful response"
        }
    }
