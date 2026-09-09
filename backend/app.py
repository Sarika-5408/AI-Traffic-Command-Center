"""
app.py

AI-Powered Intelligent Traffic Monitoring and Accident Risk Prediction System
"""

import time
import os
import cv2

from flask import Flask
from flask_cors import CORS

from config import Config 
from pathlib import Path 
VIDEO_PATH = Path(__file__).resolve().parents[1] / "frontend" / "public" / "traffic.mp4"
from services.state import state
from services.overall_risk import calculate_overall_risk
from services.traffic_command import generate_traffic_command
from utils.helpers import average_speed_kmh, time_to_collision_seconds

from pathlib import Path
from modules.person2.risk_engine import compute_accident_risk
from modules.person3.traffic_context import calculate_traffic_density, calculate_congestion
from modules.person3.weather_service import get_current_weather
from modules.person3.road_condition import calculate_road_condition
from modules.person3.time_context import get_time_of_day
from modules.person3.signal_controller import controller as signal_controller
from modules.person3.risk_calculator import calculate_external_risk

from routes import register_routes


app = Flask(__name__)
CORS(app)
register_routes(app)


# Weather cache
_weather_cache = {"data": None, "fetched_at": 0}
WEATHER_REFRESH_SECONDS = 120


# YOLO tracker + video
yolo_tracker = None
video_capture = cv2.VideoCapture(str(VIDEO_PATH))


def _get_weather_cached():
    now = time.time()

    if (
        _weather_cache["data"] is None
        or (now - _weather_cache["fetched_at"]) > WEATHER_REFRESH_SECONDS
    ):
        _weather_cache["data"] = get_current_weather()
        _weather_cache["fetched_at"] = now

    return _weather_cache["data"]


def simulation_tick():
    """One full Person1 -> Person2 -> Person3 -> Overall Risk cycle."""

    # Person 1 - YOLO vehicle detection/tracking
    success, frame = video_capture.read()

    if not success:
        video_capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
        success, frame = video_capture.read()

    vehicles = yolo_tracker.process_frame(frame) if success and yolo_tracker else []

    # Person 2 - Accident / near-miss risk
    risk_events, accident_risk_score = compute_accident_risk(vehicles)

    # Person 3 - Traffic context
    avg_speed = average_speed_kmh(vehicles)

    density = calculate_traffic_density(
        len(vehicles),
        Config.ROAD_CAPACITY
    )

    congestion = calculate_congestion(
        len(vehicles),
        density["density_ratio"],
        avg_speed
    )

    weather = _get_weather_cached()
    road_condition = calculate_road_condition(weather)
    time_context = get_time_of_day()
    signal = signal_controller.tick()

    external_risk = calculate_external_risk(
        congestion,
        road_condition,
        weather,
        time_context,
        signal
    )

    # Overall risk
    overall = calculate_overall_risk(
    accident_risk_score=accident_risk_score,
    external_risk_score=external_risk["external_risk_score"],
    vehicle_density_ratio=density["density_ratio"],
    )
    traffic_command = generate_traffic_command(
        overall_risk_score=overall["overall_risk_score"],
        overall_risk_level=overall["overall_risk_level"],
        accident_risk_score=accident_risk_score,
    )
    signal_controller.apply_ai_command(traffic_command["command"])

    traffic_context = {
        "density": density,
        "congestion": congestion,
        "weather": weather,
        "road_condition": road_condition,
        "time_context": time_context,
        "signal": signal,
        "traffic_command": traffic_command,
        "external_risk": external_risk,
        "accident_risk_score": accident_risk_score,
        "average_speed_kmh": round(avg_speed, 1),
        "ttc_seconds": time_to_collision_seconds(accident_risk_score),
    }

    state.update(
        vehicles=vehicles,
        new_risk_events=risk_events,
        overall_risk=overall,
        traffic_context=traffic_context,
    )


# First data update
simulation_tick()

# Start background processing
state.start(simulation_tick)


if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
        use_reloader=False
    )
