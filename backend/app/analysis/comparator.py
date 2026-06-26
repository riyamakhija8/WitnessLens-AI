from __future__ import annotations

import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from difflib import SequenceMatcher
from itertools import combinations
from typing import Any


FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    "actors": ("actors", "actor", "people", "persons", "person", "suspects"),
    "actions": ("actions", "action", "events", "event", "incident", "incidents"),
    "locations": ("locations", "location", "places", "place", "scene"),
    "times": ("times", "time", "timestamps", "timestamp", "datetime", "date_time"),
    "objects": (
        "objects",
        "object",
        "items",
        "item",
        "vehicles",
        "vehicle",
        "targets",
        "target",
    ),
    "claims": ("claims", "claim", "statements", "statement"),
    "uncertainties": ("uncertainties", "uncertainty", "unknowns", "unknown"),
}

NESTED_FACT_KEYS = ("facts", "ai_facts", "gemini_facts", "extracted_facts")
AGREEMENT_FIELDS = ("locations", "times", "objects", "actions")
CONTRADICTION_FIELDS = ("times", "locations", "objects", "actors")
TIME_CONFLICT_TOLERANCE_MINUTES = 15

COLOR_WORDS = {
    "black",
    "blue",
    "brown",
    "gold",
    "gray",
    "green",
    "grey",
    "maroon",
    "orange",
    "red",
    "silver",
    "white",
    "yellow",
}

VEHICLE_TERMS: dict[str, str] = {
    "auto": "car",
    "automobile": "car",
    "bike": "motorcycle",
    "bus": "bus",
    "car": "car",
    "motorbike": "motorcycle",
    "motorcycle": "motorcycle",
    "scooter": "scooter",
    "sedan": "car",
    "suv": "suv",
    "truck": "truck",
    "van": "van",
    "vehicle": "vehicle",
}

OBJECT_TERMS: dict[str, str] = {
    **VEHICLE_TERMS,
    "bag": "bag",
    "bottle": "bottle",
    "helmet": "helmet",
    "jacket": "jacket",
    "knife": "knife",
    "phone": "phone",
    "pistol": "gun",
    "revolver": "gun",
    "weapon": "weapon",
}

EVENT_KEYWORDS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("collision", ("accident", "collision", "collided", "crash", "hit", "impact", "struck")),
    ("argument", ("argument", "argued", "fight", "fighting", "quarrel", "shouting")),
    ("arrival", ("arrived", "came", "entered", "entry", "walked in")),
    ("departure", ("departed", "exited", "left", "ran away", "walked out")),
    ("theft", ("robbed", "stole", "theft", "took")),
    ("assault", ("assault", "attacked", "punched", "slapped")),
)

STOPWORDS = {
    "a",
    "an",
    "and",
    "around",
    "at",
    "by",
    "in",
    "near",
    "nearby",
    "of",
    "on",
    "approximately",
    "approx",
    "the",
    "to",
    "was",
    "were",
}


@dataclass(frozen=True)
class NormalizedFact:
    value: str
    normalized: str
    field: str


@dataclass(frozen=True)
class NormalizedWitness:
    witness_id: str
    fields: dict[str, list[NormalizedFact]]
    color_observations: list[dict[str, str]]


def compare_witness_statements(witnesses: list[dict[str, Any]]) -> dict[str, Any]:
    """Compare extracted facts from multiple witnesses."""

    normalized_witnesses = [
        _normalize_witness(facts, index) for index, facts in enumerate(witnesses)
    ]

    agreements = _detect_agreements(normalized_witnesses)
    contradictions = _detect_contradictions(normalized_witnesses)
    consistency_score = _calculate_consistency_score(
        witness_count=len(normalized_witnesses),
        agreements=agreements,
        contradictions=contradictions,
    )

    return {
        "agreements": agreements,
        "contradictions": contradictions,
        "consistency_score": consistency_score,
    }


def compare_witnesses(witnesses: list[dict[str, Any]]) -> dict[str, Any]:
    """Backward-friendly alias for callers that prefer a shorter name."""

    return compare_witness_statements(witnesses)


def get_witness_label(facts: dict[str, Any], index: int) -> str:
    """Return a stable human-readable witness id."""

    for key in ("witness_id", "witness", "name", "witness_name", "id"):
        value = facts.get(key)
        if value:
            return str(value).strip()

    return f"witness_{index + 1}"


def extract_field_values(facts: dict[str, Any], field: str) -> list[str]:
    """Extract string values for a canonical fact field."""

    aliases = FIELD_ALIASES.get(field, (field,))
    values: list[str] = []

    for source in _fact_sources(facts):
        for alias in aliases:
            value = _case_insensitive_get(source, alias)
            for item in _ensure_list(value):
                text = _stringify_value(item)
                if text:
                    values.append(text)

    return _dedupe_preserve_order(values)


def normalize_time(value: str) -> str:
    """Normalize a time expression to HH:MM when possible."""

    return _normalize_time(value)


def normalize_fact_value(value: str, field: str) -> str:
    """Normalize a fact value for comparison."""

    return _normalize_value(value, field)


def _normalize_witness(facts: dict[str, Any], index: int) -> NormalizedWitness:
    fields: dict[str, list[NormalizedFact]] = {}

    for field in FIELD_ALIASES:
        field_values = []
        for value in extract_field_values(facts, field):
            normalized = _normalize_value(value, field)
            if normalized:
                field_values.append(
                    NormalizedFact(value=value, normalized=normalized, field=field)
                )
        fields[field] = _dedupe_normalized_facts(field_values)

    color_sources = (
        fields.get("objects", [])
        + fields.get("claims", [])
        + fields.get("actions", [])
    )

    return NormalizedWitness(
        witness_id=get_witness_label(facts, index),
        fields=fields,
        color_observations=_extract_color_observations(color_sources),
    )


def _detect_agreements(witnesses: list[NormalizedWitness]) -> list[dict[str, Any]]:
    agreements: list[dict[str, Any]] = []

    for field in AGREEMENT_FIELDS:
        for group in _build_value_groups(witnesses, field):
            witness_ids = sorted(group["witnesses"])
            if len(witness_ids) < 2:
                continue

            agreements.append(
                {
                    "type": _agreement_type(field),
                    "field": field,
                    "value": _representative_value(field, group),
                    "witnesses": witness_ids,
                    "support_count": len(witness_ids),
                }
            )

    return agreements


def _detect_contradictions(witnesses: list[NormalizedWitness]) -> list[dict[str, Any]]:
    contradictions = _detect_vehicle_color_contradictions(witnesses)

    for field in CONTRADICTION_FIELDS:
        if not _has_field_conflict(witnesses, field):
            continue

        groups = _build_value_groups(witnesses, field)
        values = [
            {
                "value": _representative_value(field, group),
                "witnesses": sorted(group["witnesses"]),
            }
            for group in groups
            if group["witnesses"]
        ]

        contradictions.append(
            {
                "type": _contradiction_type(field),
                "field": field,
                "description": f"Witnesses reported different {_contradiction_type(field)} values.",
                "explanation": _build_contradiction_explanation(field, values),
                "values": values,
            }
        )

    return contradictions


def _detect_vehicle_color_contradictions(
    witnesses: list[NormalizedWitness],
) -> list[dict[str, Any]]:
    color_map: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))

    for witness in witnesses:
        for observation in witness.color_observations:
            subject = observation["subject"]
            color = observation["color"]
            if subject in VEHICLE_TERMS.values() or subject == "vehicle":
                color_map[subject][color].add(witness.witness_id)

    contradictions: list[dict[str, Any]] = []

    for subject, colors in color_map.items():
        active_colors = {
            color: witness_ids for color, witness_ids in colors.items() if witness_ids
        }
        all_witnesses = set().union(*active_colors.values()) if active_colors else set()

        if len(active_colors) < 2 or len(all_witnesses) < 2:
            continue

        contradictions.append(
            {
                "type": "vehicle_color",
                "field": "vehicle color",
                "description": f"Witnesses reported different colors for the {subject}.",
                "explanation": _build_contradiction_explanation("vehicle color", [
                    {"value": color, "witnesses": sorted(witness_ids)}
                    for color, witness_ids in sorted(active_colors.items())
                ]),
                "values": [
                    {"value": color, "witnesses": sorted(witness_ids)}
                    for color, witness_ids in sorted(active_colors.items())
                ],
            }
        )

    return contradictions


def _build_contradiction_explanation(field: str, values: list[dict[str, Any]]) -> str:
    if not values:
        return ""

    if field == "times":
        prefix = "Witnesses reported conflicting times."
    elif field == "locations":
        prefix = "Witnesses reported conflicting locations."
    elif field == "objects":
        prefix = "Witnesses reported different objects."
    elif field == "actors":
        prefix = "Witnesses reported different actors."
    elif field == "vehicle color":
        prefix = "Witnesses reported different vehicle colors."
    else:
        prefix = f"Witnesses reported conflicting {field}."

    value_summaries = [
        f"{item['value']} ({', '.join(item['witnesses'])})"
        for item in values
    ]

    return f"{prefix} Values: {', '.join(value_summaries)}."


def _has_field_conflict(witnesses: list[NormalizedWitness], field: str) -> bool:
    per_witness = {
        witness.witness_id: {fact.normalized for fact in witness.fields.get(field, [])}
        for witness in witnesses
    }

    populated = {
        witness_id: values for witness_id, values in per_witness.items() if values
    }
    if len(populated) < 2:
        return False

    for left, right in combinations(populated.values(), 2):
        if field == "times":
            if _time_sets_conflict(left, right):
                return True
            continue

        if not _sets_have_equivalent_value(left, right, field):
            return True

    return False


def _time_sets_conflict(left: set[str], right: set[str]) -> bool:
    for left_value in left:
        for right_value in right:
            if left_value == right_value:
                return False

            left_minutes = _time_to_minutes(left_value)
            right_minutes = _time_to_minutes(right_value)
            if left_minutes is None or right_minutes is None:
                continue

            if abs(left_minutes - right_minutes) <= TIME_CONFLICT_TOLERANCE_MINUTES:
                return False

    return True


def _sets_have_equivalent_value(left: set[str], right: set[str], field: str) -> bool:
    return any(_are_equivalent_values(a, b, field) for a in left for b in right)


def _build_value_groups(
    witnesses: list[NormalizedWitness], field: str
) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []

    for witness in witnesses:
        seen_in_witness: set[str] = set()

        for fact in witness.fields.get(field, []):
            if not fact.normalized or fact.normalized in seen_in_witness:
                continue

            seen_in_witness.add(fact.normalized)
            group = _find_matching_group(groups, fact.normalized, field)

            if group is None:
                group = {
                    "key": fact.normalized,
                    "display_counts": Counter(),
                    "witnesses": set(),
                }
                groups.append(group)

            group["display_counts"][fact.value] += 1
            group["witnesses"].add(witness.witness_id)

    return groups


def _find_matching_group(
    groups: list[dict[str, Any]], value: str, field: str
) -> dict[str, Any] | None:
    for group in groups:
        if _are_equivalent_values(group["key"], value, field):
            return group

    return None


def _are_equivalent_values(left: str, right: str, field: str) -> bool:
    if left == right:
        return True

    if field == "times":
        return False

    left_tokens = set(left.split())
    right_tokens = set(right.split())

    if left_tokens and right_tokens:
        smaller = min(left_tokens, right_tokens, key=len)
        larger = max(left_tokens, right_tokens, key=len)

        if len(smaller) >= 2 and smaller.issubset(larger):
            return True

    threshold = 0.82 if field in {"locations", "actions"} else 0.9
    return SequenceMatcher(None, left, right).ratio() >= threshold


def _calculate_consistency_score(
    witness_count: int, agreements: list[dict[str, Any]], contradictions: list[dict[str, Any]]
) -> int:
    if witness_count <= 1:
        return 100

    score = 100
    penalties = {
        "vehicle_color": 18,
        "time": 18,
        "location": 15,
        "object": 12,
        "actor": 12,
    }

    for contradiction in contradictions:
        score -= penalties.get(contradiction.get("type"), 10)

    agreement_types = {agreement["type"] for agreement in agreements}
    missing_agreement_types = max(0, len(AGREEMENT_FIELDS) - len(agreement_types))
    score -= missing_agreement_types * 3
    score += min(len(agreements), 5) * 2

    return max(0, min(100, int(round(score))))


def _agreement_type(field: str) -> str:
    return "event" if field == "actions" else field.rstrip("s")


def _contradiction_type(field: str) -> str:
    return field.rstrip("s")


def _representative_value(field: str, group: dict[str, Any]) -> str:
    key = group["key"]

    if field == "objects" and key in OBJECT_TERMS.values():
        return key

    if field == "actions" and key in {event for event, _ in EVENT_KEYWORDS}:
        return key

    if field == "times" and _time_to_minutes(key) is not None:
        return group["display_counts"].most_common(1)[0][0]

    return group["display_counts"].most_common(1)[0][0]


def _normalize_value(value: str, field: str) -> str:
    if field == "times":
        return _normalize_time(value)

    if field == "objects":
        canonical_object = _canonical_object(value)
        if canonical_object:
            return canonical_object

        return _normalize_text(_remove_color_words(value))

    if field == "actions":
        canonical_event = _canonical_event(value)
        if canonical_event:
            return canonical_event

    return _normalize_text(value)


def _normalize_time(value: str) -> str:
    text = value.lower().replace(".", "")
    pattern = re.compile(
        r"\b(?P<hour>[01]?\d|2[0-3])(?::(?P<minute>[0-5]\d))?\s*(?P<ampm>am|pm)?\b"
    )

    for match in pattern.finditer(text):
        raw = match.group(0)
        hour = int(match.group("hour"))
        minute = int(match.group("minute") or 0)
        ampm = match.group("ampm")

        if ampm:
            if ampm == "pm" and hour != 12:
                hour += 12
            elif ampm == "am" and hour == 12:
                hour = 0
        elif ":" not in raw:
            continue

        return f"{hour:02d}:{minute:02d}"

    return _normalize_text(value)


def _normalize_text(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[^a-z0-9:]+", " ", text)
    words = [word for word in text.split() if word not in STOPWORDS]
    return " ".join(words).strip()


def _remove_color_words(value: str) -> str:
    pattern = r"\b(" + "|".join(sorted(COLOR_WORDS)) + r")\b"
    return re.sub(pattern, " ", value, flags=re.IGNORECASE)


def _canonical_object(value: str) -> str:
    tokens = set(_normalize_text(value).split())

    for term, canonical in OBJECT_TERMS.items():
        if term in tokens:
            return canonical

    return ""


def _canonical_event(value: str) -> str:
    normalized = _normalize_text(value)

    for event, keywords in EVENT_KEYWORDS:
        if any(keyword in normalized for keyword in keywords):
            return event

    return ""


def _extract_color_observations(
    facts: list[NormalizedFact],
) -> list[dict[str, str]]:
    observations: list[dict[str, str]] = []

    for fact in facts:
        tokens = _normalize_text(fact.value).split()

        for index, token in enumerate(tokens):
            if token not in COLOR_WORDS:
                continue

            subject = _nearby_object(tokens, index) or _canonical_object(fact.value)
            if subject:
                observations.append(
                    {"color": _normalize_color(token), "subject": subject}
                )

    return observations


def _nearby_object(tokens: list[str], color_index: int) -> str:
    window_start = max(0, color_index - 4)
    window_end = min(len(tokens), color_index + 5)
    window = tokens[window_start:window_end]

    for token in window:
        if token in OBJECT_TERMS:
            return OBJECT_TERMS[token]

    return ""


def _normalize_color(color: str) -> str:
    return "gray" if color == "grey" else color


def _time_to_minutes(value: str) -> int | None:
    match = re.fullmatch(r"(?P<hour>[0-2]\d):(?P<minute>[0-5]\d)", value)
    if not match:
        return None

    hour = int(match.group("hour"))
    minute = int(match.group("minute"))
    if hour > 23:
        return None

    return hour * 60 + minute


def _fact_sources(facts: dict[str, Any]) -> list[dict[str, Any]]:
    sources = [facts]

    for key in NESTED_FACT_KEYS:
        nested = facts.get(key)
        if isinstance(nested, dict):
            sources.append(nested)

    return sources


def _case_insensitive_get(source: dict[str, Any], key: str) -> Any:
    if key in source:
        return source[key]

    lower_key = key.lower()
    for candidate_key, value in source.items():
        if str(candidate_key).lower() == lower_key:
            return value

    return None


def _ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, (tuple, set)):
        return list(value)

    return [value]


def _stringify_value(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, (int, float)):
        return str(value)

    if isinstance(value, dict):
        for key in ("value", "text", "name", "description", "claim"):
            nested = _case_insensitive_get(value, key)
            if nested:
                return _stringify_value(nested)

        parts = [_stringify_value(item) for item in value.values()]
        return ", ".join(part for part in parts if part)

    if isinstance(value, (list, tuple, set)):
        parts = [_stringify_value(item) for item in value]
        return ", ".join(part for part in parts if part)

    return str(value).strip()


def _dedupe_preserve_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []

    for value in values:
        key = _normalize_text(value)
        if not key or key in seen:
            continue

        seen.add(key)
        deduped.append(value)

    return deduped


def _dedupe_normalized_facts(facts: list[NormalizedFact]) -> list[NormalizedFact]:
    seen: set[str] = set()
    deduped: list[NormalizedFact] = []

    for fact in facts:
        if fact.normalized in seen:
            continue

        seen.add(fact.normalized)
        deduped.append(fact)

    return deduped
