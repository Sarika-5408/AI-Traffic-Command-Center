"""GET /api/alerts — human-readable alert feed derived from Person 2 events"""
from flask import Blueprint, jsonify
from datetime import datetime
from services.state import state

alerts_bp = Blueprint("alerts", __name__)

_LABELS = {
    "NEAR_MISS": "NEAR-MISS DETECTED",
    "SUDDEN_BRAKING": "SUDDEN SPEED CHANGE",
    "SUDDEN_SWERVE": "SUDDEN SWERVE DETECTED",
    "UNSAFE_DISTANCE": "UNSAFE VEHICLE DISTANCE",
}


@alerts_bp.route("/api/alerts")
def alerts():
    snap = state.snapshot()
    events = snap["risk_events"]
    now = datetime.now().strftime("%I:%M %p")

    formatted = []
    for e in events[:20]:
        formatted.append({
            "event_id": e["event_id"],
            "title": _LABELS.get(e["type"], e["type"]),
            "type": e["type"],
            "risk_level": e["risk_level"],
            "risk_score": e["risk_score"],
            "vehicles": e["vehicles"],
            "location": e["location"],
            "time": now,
        })

    return jsonify({
        "count": len(formatted),
        "alerts": formatted,
    })
