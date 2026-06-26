import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.analysis.comparator import compare_witness_statements
from app.analysis.reliability import score_witness_reliability
from app.analysis.report_generator import generate_investigation_report
from app.analysis.timeline import reconstruct_timeline
from app.ai.gemini_extractor import extract_facts_with_gemini
from app.ingestion.pdf_service import extract_text_from_pdf
from app.ingestion.cleaner import clean_text
from app.ingestion.parser import extract_basic_entities
from app.ingestion.fact_extractor import extract_facts


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("witnesslens")

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class WitnessAnalysisRequest(BaseModel):
    witnesses: list[dict[str, Any]]


app = FastAPI()


@app.get("/")
def home():
    return {"message": "WitnessLens AI Running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    logger.info("Upload request started for %s", file.filename)

    if not file.filename:
        logger.warning("Upload rejected: missing filename")
        return _error_response("Upload rejected: missing filename", status_code=400)

    try:
        contents = await file.read()
        if not contents:
            logger.warning("Upload rejected: empty file for %s", file.filename)
            return _error_response("Upload rejected: empty file", status_code=400)

        safe_filename = Path(file.filename).name
        file_path = UPLOAD_DIR / safe_filename

        with open(file_path, "wb") as handle:
            handle.write(contents)

        logger.info("File saved: %s (%d bytes)", safe_filename, len(contents))

        try:
            text = extract_text_from_pdf(str(file_path))
        except Exception as exc:  # pragma: no cover - defensive path
            logger.exception("PDF extraction failed for %s", safe_filename)
            return _error_response(
                message="PDF extraction failed",
                details=str(exc),
                status_code=422,
            )

        if not text or not text.strip():
            logger.warning("PDF extraction produced empty text for %s", safe_filename)
            return _error_response(
                message="PDF extraction produced no readable text",
                details="The uploaded file did not contain extractable text.",
                status_code=422,
            )

        cleaned_text = clean_text(text)
        entities = extract_basic_entities(cleaned_text)
        facts = extract_facts(cleaned_text)

        try:
            ai_facts = extract_facts_with_gemini(cleaned_text)
        except Exception as exc:  # pragma: no cover - defensive path
            logger.exception("Gemini extraction failed for %s", safe_filename)
            return _error_response(
                message="Gemini extraction failed",
                details=str(exc),
                status_code=502,
            )

        payload = {
            "success": True,
            "filename": file.filename,
            "characters": len(cleaned_text),
            "entities": entities,
            "facts": facts,
            "ai_facts": ai_facts,
            "preview": cleaned_text[:1000],
        }
        logger.info("Upload completed successfully for %s", safe_filename)
        return payload
    except Exception as exc:  # pragma: no cover - defensive path
        logger.exception("Upload workflow crashed for %s", file.filename)
        return _error_response(
            message="Upload workflow failed",
            details=str(exc),
            status_code=500,
        )


@app.post("/compare")
def compare_witnesses(request: WitnessAnalysisRequest):
    _require_witnesses(request.witnesses, minimum=2)
    return compare_witness_statements(request.witnesses)


@app.post("/timeline")
def build_timeline(request: WitnessAnalysisRequest):
    _require_witnesses(request.witnesses, minimum=1)
    return reconstruct_timeline(request.witnesses)


@app.post("/reliability")
def score_reliability(request: WitnessAnalysisRequest):
    _require_witnesses(request.witnesses, minimum=1)

    comparison_result = (
        compare_witness_statements(request.witnesses)
        if len(request.witnesses) > 1
        else {"agreements": [], "contradictions": [], "consistency_score": 100}
    )

    return score_witness_reliability(request.witnesses, comparison_result)


@app.post("/report")
def create_investigation_report(request: WitnessAnalysisRequest):
    _require_witnesses(request.witnesses, minimum=1)

    comparison_result = (
        compare_witness_statements(request.witnesses)
        if len(request.witnesses) > 1
        else {"agreements": [], "contradictions": [], "consistency_score": 100}
    )
    timeline_result = reconstruct_timeline(request.witnesses)
    reliability_result = score_witness_reliability(
        request.witnesses,
        comparison_result,
    )
    report_path = generate_investigation_report(
        witnesses=request.witnesses,
        comparison_result=comparison_result,
        timeline_result=timeline_result,
        reliability_result=reliability_result,
    )

    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=Path(report_path).name,
    )


def _require_witnesses(witnesses: list[dict[str, Any]], minimum: int) -> None:
    if len(witnesses) < minimum:
        raise HTTPException(
            status_code=400,
            detail=f"At least {minimum} witness statement(s) are required.",
        )


def _error_response(message: str, details: str | None = None, status_code: int = 500) -> JSONResponse:
    payload: dict[str, Any] = {
        "success": False,
        "error": message,
    }
    if details is not None:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)
