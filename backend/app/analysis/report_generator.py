from __future__ import annotations

import textwrap
from datetime import datetime
from pathlib import Path
from typing import Any

import fitz


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
MARGIN = 48
LINE_HEIGHT = 14


def generate_investigation_report(
    witnesses: list[dict[str, Any]],
    comparison_result: dict[str, Any],
    timeline_result: dict[str, Any],
    reliability_result: dict[str, Any],
    output_path: str | Path | None = None,
) -> str:
    """Generate a PDF investigation report and return its file path."""

    if output_path is None:
        output_dir = Path(__file__).resolve().parents[1] / "uploads" / "reports"
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"witnesslens_investigation_report_{timestamp}.pdf"
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

    writer = _PdfReportWriter()
    writer.heading("WitnessLens AI Investigation Report", size=18)
    writer.paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    writer.paragraph(f"Witnesses analyzed: {len(witnesses)}")
    writer.spacer()

    writer.heading("Executive Summary")
    writer.paragraph(
        "Consistency score: "
        f"{comparison_result.get('consistency_score', 0)} / 100"
    )
    writer.paragraph(
        "Overall reliability score: "
        f"{reliability_result.get('overall_reliability_score', 0)} / 100"
    )
    writer.spacer()

    writer.heading("Agreements")
    agreements = comparison_result.get("agreements", [])
    if agreements:
        for agreement in agreements:
            writer.bullet(
                f"{agreement.get('type', 'fact').title()}: "
                f"{agreement.get('value', '')} "
                f"(witnesses: {', '.join(agreement.get('witnesses', []))})"
            )
    else:
        writer.paragraph("No multi-witness agreements were detected.")
    writer.spacer()

    writer.heading("Contradictions")
    contradictions = comparison_result.get("contradictions", [])
    if contradictions:
        for contradiction in contradictions:
            writer.bullet(contradiction.get("description", "Contradiction detected."))
            explanation = contradiction.get("explanation")
            if explanation:
                writer.indented(explanation)
            for value in contradiction.get("values", []):
                writer.indented(
                    f"{value.get('value', '')}: "
                    f"{', '.join(value.get('witnesses', []))}"
                )
    else:
        writer.paragraph("No contradictions were detected.")
    writer.spacer()

    writer.heading("Timeline")
    timeline = timeline_result.get("timeline", [])
    if timeline:
        for item in timeline:
            writer.bullet(
                f"{item.get('sequence_number')}. {item.get('time')} - "
                f"{'; '.join(item.get('events', []) or ['No event text'])}"
            )
            writer.indented(f"Witnesses: {', '.join(item.get('witnesses', []))}")
            if item.get("locations"):
                writer.indented(f"Locations: {', '.join(item['locations'])}")
            if item.get("actors"):
                writer.indented(f"Actors: {', '.join(item['actors'])}")
            if item.get("objects"):
                writer.indented(f"Objects: {', '.join(item['objects'])}")
    else:
        writer.paragraph("No dated timeline events were detected.")

    undated_events = timeline_result.get("undated_events", [])
    if undated_events:
        writer.spacer()
        writer.heading("Undated Events", size=12)
        for item in undated_events:
            writer.bullet(
                f"{item.get('witness')}: "
                f"{'; '.join(item.get('events', []) or ['No event text'])}"
            )
    writer.spacer()

    writer.heading("Reliability Scores")
    for score in reliability_result.get("witness_scores", []):
        writer.bullet(
            f"{score.get('witness')}: {score.get('reliability_score')} / 100 "
            f"({score.get('assessment')})"
        )
        writer.indented(
            "Agreements: "
            f"{score.get('agreement_count', 0)}, contradictions: "
            f"{score.get('contradiction_count', 0)}, uncertainties: "
            f"{score.get('uncertainty_count', 0)}"
        )

    writer.save(output_path)
    return str(output_path)


class _PdfReportWriter:
    def __init__(self) -> None:
        self.document = fitz.open()
        self.page = self.document.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        self.y = MARGIN

    def heading(self, text: str, size: int = 14) -> None:
        self._ensure_space(size + 10)
        self.page.insert_text(
            (MARGIN, self.y),
            text,
            fontsize=size,
            fontname="helv",
            color=(0.08, 0.12, 0.18),
        )
        self.y += size + 10

    def paragraph(self, text: str) -> None:
        for line in self._wrap(text):
            self._write_line(line)

    def bullet(self, text: str) -> None:
        for index, line in enumerate(self._wrap(text, width=88)):
            prefix = "- " if index == 0 else "  "
            self._write_line(prefix + line)

    def indented(self, text: str) -> None:
        for line in self._wrap(text, width=84):
            self._write_line("    " + line, size=9)

    def spacer(self) -> None:
        self.y += 8
        self._ensure_space(LINE_HEIGHT)

    def save(self, output_path: str | Path) -> None:
        self.document.save(str(output_path))
        self.document.close()

    def _write_line(self, text: str, size: int = 10) -> None:
        self._ensure_space(LINE_HEIGHT)
        self.page.insert_text(
            (MARGIN, self.y),
            text,
            fontsize=size,
            fontname="helv",
            color=(0, 0, 0),
        )
        self.y += LINE_HEIGHT

    def _ensure_space(self, needed: int) -> None:
        if self.y + needed <= PAGE_HEIGHT - MARGIN:
            return

        self.page = self.document.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        self.y = MARGIN

    def _wrap(self, text: str, width: int = 92) -> list[str]:
        if not text:
            return [""]

        return textwrap.wrap(str(text), width=width) or [""]
