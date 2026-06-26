from __future__ import annotations

from statistics import mean
from typing import Any

from app.analysis.comparator import (
    compare_witness_statements,
    extract_field_values,
    get_witness_label,
)


CORE_FIELDS = ("actors", "actions", "locations", "times", "objects", "claims")


def score_witness_reliability(
    witnesses: list[dict[str, Any]],
    comparison_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Score each witness using completeness, corroboration, conflicts, and uncertainty."""

    if comparison_result is None:
        comparison_result = (
            compare_witness_statements(witnesses)
            if len(witnesses) > 1
            else {"agreements": [], "contradictions": [], "consistency_score": 100}
        )

    witness_scores = []

    for index, facts in enumerate(witnesses):
        witness_id = get_witness_label(facts, index)
        populated_fields = [
            field for field in CORE_FIELDS if extract_field_values(facts, field)
        ]
        agreement_count = _agreement_count_for_witness(
            witness_id, comparison_result.get("agreements", [])
        )
        contradiction_count = _contradiction_count_for_witness(
            witness_id, comparison_result.get("contradictions", [])
        )
        uncertainty_count = len(extract_field_values(facts, "uncertainties"))

        score = 60
        score += min(len(populated_fields) * 4, 24)
        score += min(agreement_count * 5, 15)
        score -= min(contradiction_count * 12, 36)
        score -= min(uncertainty_count * 4, 16)
        score = max(0, min(100, int(round(score))))

        witness_scores.append(
            {
                "witness": witness_id,
                "reliability_score": score,
                "populated_fields": populated_fields,
                "agreement_count": agreement_count,
                "contradiction_count": contradiction_count,
                "uncertainty_count": uncertainty_count,
                "assessment": _assessment_label(score),
            }
        )

    overall_score = int(
        round(mean(score["reliability_score"] for score in witness_scores))
    ) if witness_scores else 0

    return {
        "witness_scores": witness_scores,
        "overall_reliability_score": overall_score,
        "consistency_score": comparison_result.get("consistency_score", 0),
    }


def _agreement_count_for_witness(
    witness_id: str, agreements: list[dict[str, Any]]
) -> int:
    return sum(1 for agreement in agreements if witness_id in agreement.get("witnesses", []))


def _contradiction_count_for_witness(
    witness_id: str, contradictions: list[dict[str, Any]]
) -> int:
    count = 0

    for contradiction in contradictions:
        for value in contradiction.get("values", []):
            if witness_id in value.get("witnesses", []):
                count += 1
                break

    return count


def _assessment_label(score: int) -> str:
    if score >= 85:
        return "high"

    if score >= 65:
        return "moderate"

    if score >= 45:
        return "low"

    return "critical"
