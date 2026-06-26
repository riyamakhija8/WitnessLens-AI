import re

def extract_facts(text):

    facts = {}

    time_match = re.search(r"\b\d{1,2}\s?(AM|PM|am|pm)\b", text)

    if time_match:
        facts["time"] = time_match.group()

    if "car" in text.lower():
        facts["vehicle"] = "car"

    if "motorcycle" in text.lower():
        facts["target"] = "motorcycle"

    if "hit" in text.lower():
        facts["event"] = "collision"

    return facts