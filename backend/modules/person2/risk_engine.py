"""
modules/person2/risk_engine.py

PERSON 2 — Near-miss detection, sudden braking, sudden swerving, unsafe
distance, collision risk, accident risk scoring.

This module is adapted directly from the near-miss detection algorithm you
supplied in `integrate_person1.py` (kept unmodified for reference at
backend/modules/person2/original_person2_script.py). That script:
  - merged Person 1's tracking + speed CSVs
  - compared every pair of vehicles within the same frame
  - flagged a near-miss when euclidean distance between (x_center, y_center)
    dropped below a threshold

The core distance-based near-miss check below is the SAME algorithm, kept
intact. It has simply been adapted from a batch (CSV-in/CSV-out) job into a
function that runs on one live frame of Person 1's output at a time, and
extended with sudden-braking, sudden-swerving and a combined risk score so it
can feed the required event schema:

{
  "event_id": "R001",
  "type": "NEAR_MISS",
  "risk_score": 82,
  "risk_level": "CRITICAL",
  "vehicles": ["V001", "V008"],
  "location": "JUNCTION_1"
}

Risk levels: 0-30 LOW, 31-60 MEDIUM, 61-80 HIGH, 81-100 CRITICAL
"""

import math
import itertools

from config import Config

_event_counter = itertools.count(1)


def _risk_level(score):
    if score <= 30:
        return "LOW"
    if score <= 60:
        return "MEDIUM"
    if score <= 80:
        return "HIGH"
    return "CRITICAL"


def _next_event_id():
    return f"R{next(_event_counter):03d}"


def detect_near_miss(vehicles, threshold=None):
    """
    Same core algorithm as the original integrate_person1.py detect_near_miss():
    compare every pair of vehicles in the current frame and flag pairs whose
    (x_center, y_center) distance is below `threshold`.
    """
    threshold = threshold or Config.NEAR_MISS_DISTANCE_THRESHOLD_PX
    events = []

    for v1, v2 in itertools.combinations(vehicles, 2):
        distance = math.sqrt(
            (v1["x_center"] - v2["x_center"]) ** 2 +
            (v1["y_center"] - v2["y_center"]) ** 2
        )

        if distance < threshold:
            # Closer distance + higher combined speed => higher risk
            speed_factor = min(1.0, (v1["speed_pixels_per_sec"] + v2["speed_pixels_per_sec"]) / 160)
            proximity_factor = 1 - (distance / threshold)
            score = round(45 + proximity_factor * 35 + speed_factor * 20)
            score = max(0, min(100, score))

            events.append({
                "event_id": _next_event_id(),
                "type": "NEAR_MISS",
                "risk_score": score,
                "risk_level": _risk_level(score),
                "vehicles": [v1["vehicle_id"], v2["vehicle_id"]],
                "location": Config.JUNCTION_ID,
                "distance_px": round(distance, 2),
            })

    return events


def detect_sudden_braking(vehicles, drop_ratio=None):
    drop_ratio = drop_ratio or Config.SUDDEN_BRAKE_DROP_RATIO
    events = []

    for v in vehicles:
        history = v.get("history", [])
        if len(history) < 2:
            continue
        prev_speed = history[-2]["speed"]
        curr_speed = v["speed"]
        if prev_speed <= 0:
            continue
        drop = (prev_speed - curr_speed) / prev_speed
        if drop >= drop_ratio:
            score = round(40 + min(1.0, drop) * 50)
            events.append({
                "event_id": _next_event_id(),
                "type": "SUDDEN_BRAKING",
                "risk_score": score,
                "risk_level": _risk_level(score),
                "vehicles": [v["vehicle_id"]],
                "location": Config.JUNCTION_ID,
                "speed_drop_percent": round(drop * 100, 1),
            })

    return events


def detect_sudden_swerving(vehicles, angle_threshold=None):
    """Approximates a swerve as an abnormal lateral position jump between
    the last two tracked positions relative to the vehicle's speed."""
    events = []

    for v in vehicles:
        history = v.get("history", [])
        if len(history) < 2:
            continue
        prev = history[-2]
        dx = v["x"] - prev["x"]
        dy = v["y"] - prev["y"]
        lateral_jump = math.sqrt(dx ** 2 + dy ** 2)
        expected_step = max(2, v["speed"] / 6)

        if lateral_jump > expected_step * 2.2:
            score = round(35 + min(1.0, lateral_jump / 60) * 45)
            events.append({
                "event_id": _next_event_id(),
                "type": "SUDDEN_SWERVE",
                "risk_score": score,
                "risk_level": _risk_level(score),
                "vehicles": [v["vehicle_id"]],
                "location": Config.JUNCTION_ID,
                "lateral_jump_px": round(lateral_jump, 2),
            })

    return events


def detect_unsafe_distance(vehicles, threshold=None):
    """Same-direction vehicles following too closely — distinct from
    near-miss (which is direction-agnostic proximity)."""
    threshold = (threshold or Config.NEAR_MISS_DISTANCE_THRESHOLD_PX) * 1.4
    events = []

    for v1, v2 in itertools.combinations(vehicles, 2):
        if v1["direction"] != v2["direction"]:
            continue
        distance = math.sqrt(
            (v1["x_center"] - v2["x_center"]) ** 2 +
            (v1["y_center"] - v2["y_center"]) ** 2
        )
        if distance < threshold:
            score = round(30 + (1 - distance / threshold) * 30)
            events.append({
                "event_id": _next_event_id(),
                "type": "UNSAFE_DISTANCE",
                "risk_score": score,
                "risk_level": _risk_level(score),
                "vehicles": [v1["vehicle_id"], v2["vehicle_id"]],
                "location": Config.JUNCTION_ID,
                "distance_px": round(distance, 2),
            })

    return events


def compute_accident_risk(vehicles):
    """
    Runs the full Person 2 detection suite for the current frame and returns
    (events, accident_risk_score) where accident_risk_score (0-100)
    summarizes collision risk for this frame as the highest individual event
    score, softened by the number of concurrent risk events (more concurrent
    events -> junction is more dangerous even if no single event is extreme).
    """
    events = []
    events += detect_near_miss(vehicles)
    events += detect_sudden_braking(vehicles)
    events += detect_sudden_swerving(vehicles)
    events += detect_unsafe_distance(vehicles)

    if not events:
        return events, 5  # baseline low risk when the junction is quiet

    top_score = max(e["risk_score"] for e in events)
    concurrency_bonus = min(15, (len(events) - 1) * 4)
    accident_risk_score = min(100, top_score + concurrency_bonus)

    return events, accident_risk_score
