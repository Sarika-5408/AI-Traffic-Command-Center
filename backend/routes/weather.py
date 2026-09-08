"""GET /api/weather — Person 3 weather sub-view"""
from flask import Blueprint, jsonify
from services.state import state

weather_bp = Blueprint("weather", __name__)


@weather_bp.route("/api/weather")
def weather():
    snap = state.snapshot()
    return jsonify(snap["traffic_context"].get("weather", {}))
