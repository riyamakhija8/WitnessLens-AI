from app.ai.gemini_extractor import extract_facts_with_gemini

sample_text = """
Witness Statement - Rahul Sharma

I was standing near the main gate of City Mall at approximately 8:15 PM.

I saw a man wearing a black jacket enter the building.

About 10 minutes later I heard a loud argument.
"""

print(extract_facts_with_gemini(sample_text))