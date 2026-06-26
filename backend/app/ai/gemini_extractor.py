import json
import os

from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - defensive path
    genai = None

if genai is not None:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    else:
        genai = None

model = genai.GenerativeModel("gemini-2.5-flash") if genai is not None else None


def test_gemini():
    response = model.generate_content(
        "Reply with only: Gemini Connected Successfully"
    )

    return response.text


def extract_facts_with_gemini(text):
    if model is None:
        raise RuntimeError("Gemini client is unavailable. Check the installation and GEMINI_API_KEY configuration.")

    prompt = f"""
    You are an investigation assistant.

    Analyze the witness statement and extract important facts.

    Return ONLY valid JSON.
    Do not use markdown code blocks.

    Format:

    {{
        "actors": [],
        "actions": [],
        "locations": [],
        "times": [],
        "objects": [],
        "claims": [],
        "uncertainties": []
    }}

    Witness Statement:

    {text}
    """

    response = model.generate_content(prompt)

    cleaned = response.text.strip()

    # Remove markdown if Gemini returns ```json ... ```
    cleaned = cleaned.replace("```json", "")
    cleaned = cleaned.replace("```", "")
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)

    except Exception:
        return {
            "error": "Invalid JSON returned by Gemini",
            "raw_response": response.text
        }