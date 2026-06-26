from __future__ import annotations

from typing import Any

from app.analysis.comparator import (
    extract_field_values,
    get_witness_label,
    normalize_time,
)


def reconstruct_timeline(witnesses: list[dict[str, Any]]) -> dict[str, Any]:
    """Build a chronological timeline from extracted witness facts."""

    grouped_events: dict[str, dict[str, Any]] = {}
    undated_events: list[dict[str, Any]] = []

    for index, facts in enumerate(witnesses):
        witness_id = get_witness_label(facts, index)
        times = extract_field_values(facts, "times")
        event_payload = _event_payload(facts, witness_id)

        if not times:
            if _has_event_content(event_payload):
                undated_events.append(event_payload)
            continue

        for raw_time in times:
            normalized_time = normalize_time(raw_time)
            key = normalized_time or raw_time

            if key not in grouped_events:
                grouped_events[key] = {
                    "time": raw_time,
                    "normalized_time": normalized_time,
                    "witnesses": set(),
                    "events": [],
                    "locations": [],
                    "actors": [],
                    "objects": [],
                }

            grouped_events[key]["witnesses"].add(witness_id)
            _extend_unique(grouped_events[key]["events"], event_payload["events"])
            _extend_unique(grouped_events[key]["locations"], event_payload["locations"])
            _extend_unique(grouped_events[key]["actors"], event_payload["actors"])
            _extend_unique(grouped_events[key]["objects"], event_payload["objects"])

    timeline = []
    for sequence_number, event in enumerate(
        sorted(grouped_events.values(), key=_timeline_sort_key), start=1
    ):
        witness_count = len(event["witnesses"])
        timeline.append(
            {
                "sequence_number": sequence_number,
                "time": event["time"],
                "normalized_time": event["normalized_time"],
                "witnesses": sorted(event["witnesses"]),
                "events": event["events"],
                "locations": event["locations"],
                "actors": event["actors"],
                "objects": event["objects"],
                "confidence": _confidence_for_event(witness_count, event),
            }
        )

    return {
        "timeline": timeline,
        "undated_events": undated_events,
    }


def _event_payload(facts: dict[str, Any], witness_id: str) -> dict[str, Any]:
    actions = extract_field_values(facts, "actions")
    claims = extract_field_values(facts, "claims")
    events = actions or claims

    return {
        "witness": witness_id,
        "events": events,
        "locations": extract_field_values(facts, "locations"),
        "actors": extract_field_values(facts, "actors"),
        "objects": extract_field_values(facts, "objects"),
    }


def _has_event_content(payload: dict[str, Any]) -> bool:
    return any(
        payload.get(field)
        for field in ("events", "locations", "actors", "objects")
    )


def _timeline_sort_key(event: dict[str, Any]) -> tuple[int, str]:
    normalized_time = event.get("normalized_time", "")
    if _is_hhmm(normalized_time):
        hour, minute = normalized_time.split(":")
        return int(hour) * 60 + int(minute), normalized_time

    return 9999, normalized_time


def _is_hhmm(value: str) -> bool:
    parts = value.split(":")
    if len(parts) != 2:
        return False

    hour, minute = parts
    return (
        hour.isdigit()
        and minute.isdigit()
        and 0 <= int(hour) <= 23
        and 0 <= int(minute) <= 59
    )


def _confidence_for_event(witness_count: int, event: dict[str, Any]) -> int:
    score = 60

    if witness_count > 1:
        score += 20

    populated_fields = sum(
        1 for field in ("events", "locations", "actors", "objects") if event.get(field)
    )
    score += populated_fields * 5

    return max(0, min(100, score))


def _extend_unique(target: list[str], values: list[str]) -> None:
    seen = {value.lower() for value in target}

    for value in values:
        key = value.lower()
        if key in seen:
            continue

        seen.add(key)
        target.append(value)
