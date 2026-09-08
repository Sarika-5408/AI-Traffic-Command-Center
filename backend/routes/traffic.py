"""GET /api/traffic — Person 3 output"""
from flask import Blueprint, jsonify
from services.state import state

traffic_bp = Blueprint("traffic", __name__)


@traffic_bp.route("/api/traffic")
def traffic():
    snap = state.snapshot()
    ctx = snap["traffic_context"]
    return jsonify(ctx)
