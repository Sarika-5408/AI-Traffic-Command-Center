"""GET /api/health"""
from flask import Blueprint, jsonify
from services.state import state
from config import Config

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health")
def health():
    snap = state.snapshot()
    return jsonify({
        "status": "ONLINE",
        "junction_id": Config.JUNCTION_ID,
        "junction_name": Config.JUNCTION_NAME,
        "frame_count": snap["frame_count"],
        "uptime_seconds": snap["uptime_seconds"],
        "modules": {
            "ai_model_status": "ACTIVE",
            "yolo_status": "SIMULATED" if True else "LOADED",
            "risk_engine": "RUNNING",
            "data_sync": "LIVE",
        },
    })
