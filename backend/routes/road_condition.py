"""GET /api/road-condition — Person 3 road condition sub-view"""
from flask import Blueprint, jsonify
from services.state import state

road_condition_bp = Blueprint("road_condition", __name__)


@road_condition_bp.route("/api/road-condition")
def road_condition():
    snap = state.snapshot()
    return jsonify(snap["traffic_context"].get("road_condition", {}))
