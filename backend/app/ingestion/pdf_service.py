from pathlib import Path

import fitz


def extract_text_from_pdf(pdf_path):
    path = Path(pdf_path)
    if not path.exists():
        raise RuntimeError("Uploaded file was not found on disk.")

    with path.open("rb") as handle:
        header = handle.read(5)

    if not header.startswith(b"%PDF"):
        raise RuntimeError("Uploaded file is not a valid PDF document.")

    text = ""
    pdf = fitz.open(str(path))

    try:
        for page in pdf:
            text += page.get_text()
    finally:
        pdf.close()

    if not text.strip():
        raise RuntimeError("The uploaded file did not contain extractable text.")

    return text