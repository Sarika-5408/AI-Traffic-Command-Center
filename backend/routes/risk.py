"""GET /api/risk — Person 2 output"""
from flask import Blueprint, jsonify
from services.state import state

risk_bp = Blueprint("risk", __name__)


@risk_bp.route("/api/risk")
def risk():
    snap = state.snapshot()
    events = snap["risk_events"]
    accident_risk_score = snap["traffic_context"].get("accident_risk_score", 0)

    critical = [e for e in events if e["risk_level"] == "CRITICAL"]

    return jsonify({
        "accident_risk_score": accident_risk_score,
        "recent_events": events[:15],
        "near_miss_count": len([e for e in events if e["type"] == "NEAR_MISS"]),
        "critical_event_count": len(critical),
        "ttc_seconds": snap["traffic_context"].get("ttc_seconds"),
    })
