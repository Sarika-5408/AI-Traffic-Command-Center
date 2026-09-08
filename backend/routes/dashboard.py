"""
GET /api/dashboard — single combined payload for the Dashboard page.
POST /api/traffic-context — update Person 3 runtime configuration
                             (e.g. road_capacity used for density calc).

Combines Person 1 (vehicles) + Person 2 (risk) + Person 3 (traffic context)
+ overall risk into one response so the frontend does not have to make
four separate calls on every refresh.
"""
from flask import Blueprint, jsonify, request
from services.state import state
from config import Config
from utils.helpers import vehicle_count_by_type

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard")
def dashboard():
    snap = state.snapshot()
    vehicles = snap["vehicles"]
    ctx = snap["traffic_context"]

    public_vehicles = [
        {
            "vehicle_id": v["vehicle_id"],
            "type": v["type"],
            "speed": v["speed"],
            "direction": v["direction"],
            "x": v["x"],
            "y": v["y"],
        }
        for v in vehicles
    ]

    return jsonify({
        "junction_id": Config.JUNCTION_ID,
        "junction_name": Config.JUNCTION_NAME,
        "frame": snap["frame_count"],
        "uptime_seconds": snap["uptime_seconds"],

        "vehicles": {
            "count": len(public_vehicles),
            "list": public_vehicles,
            "by_type": vehicle_count_by_type(vehicles),
        },

        "risk": {
            "accident_risk_score": ctx.get("accident_risk_score", 0),
            "recent_events": snap["risk_events"][:10],
            "near_miss_count": len([e for e in snap["risk_events"] if e["type"] == "NEAR_MISS"]),
            "ttc_seconds": ctx.get("ttc_seconds"),
        },

        "traffic_context": ctx,

        "overall_risk": snap["overall_risk"],
    })


@dashboard_bp.route("/api/traffic-context", methods=["POST"])
def update_traffic_context():
    body = request.get_json(silent=True) or {}

    if "road_capacity" in body:
        try:
            Config.ROAD_CAPACITY = max(1, int(body["road_capacity"]))
        except (TypeError, ValueError):
            return jsonify({"error": "road_capacity must be an integer"}), 400

    return jsonify({
        "updated": True,
        "road_capacity": Config.ROAD_CAPACITY,
    })
