import re

def extract_basic_entities(text):
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)

    phones = re.findall(
        r'(?:\+91)?[\s-]?[6-9]\d{9}',
        text
    )

    return {
        "emails": emails,
        "phones": phones
    }