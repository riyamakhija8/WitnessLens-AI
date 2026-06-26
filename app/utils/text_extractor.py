from pypdf import PdfReader
from docx import Document


def extract_pdf_text(file_path):
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def extract_docx_text(file_path):
    doc = Document(file_path)

    text = "\n".join(
        [paragraph.text for paragraph in doc.paragraphs]
    )

    return text


def extract_txt_text(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()