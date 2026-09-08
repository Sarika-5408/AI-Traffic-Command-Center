"""GET /api/vehicles — Person 1 output"""
from flask import Blueprint, jsonify
from services.state import state
from utils.helpers import vehicle_count_by_type, average_speed_kmh

vehicles_bp = Blueprint("vehicles", __name__)


@vehicles_bp.route("/api/vehicles")
def vehicles():
    snap = state.snapshot()
    vlist = snap["vehicles"]
    # Trim internal-only fields before sending to the frontend
    public = [
        {
            "vehicle_id": v["vehicle_id"],
            "type": v["type"],
            "speed": v["speed"],
            "direction": v["direction"],
            "x": v["x"],
            "y": v["y"],
        }
        for v in vlist
    ]
    return jsonify({
        "count": len(public),
        "vehicles": public,
        "by_type": vehicle_count_by_type(vlist),
        "average_speed_kmh": round(average_speed_kmh(vlist), 1),
        "frame": snap["frame_count"],
    })
