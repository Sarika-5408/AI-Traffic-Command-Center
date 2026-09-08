"""
GET  /api/traffic-signal            — current signal state (Person 3)
POST /api/traffic-signal/override   — manual override, used by the
                                       Dashboard's "MANUAL OVERRIDE" control
"""
from flask import Blueprint, jsonify, request
from modules.person3.signal_controller import controller

traffic_signal_bp = Blueprint("traffic_signal", __name__)


@traffic_signal_bp.route("/api/traffic-signal")
def traffic_signal():
    return jsonify(controller.status())


@traffic_signal_bp.route("/api/traffic-signal/override", methods=["POST"])
def traffic_signal_override():
    body = request.get_json(silent=True) or {}
    state_value = body.get("state")  # "RED" | "YELLOW" | "GREEN" | None (clears override)

    try:
        controller.set_manual_override(state_value)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(controller.status())
