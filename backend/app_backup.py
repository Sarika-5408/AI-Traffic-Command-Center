"""
app.py

AI-Powered Intelligent Traffic Monitoring and Accident Risk Prediction System
— single Flask backend application.

Pipeline per simulation tick:
  Person 1 (vehicle detection/tracking)
        -> Person 2 (near-miss / braking / swerving / accident risk)
        -> Person 3 (density, congestion, weather, road, signal, time, external risk)
        -> Overall Risk (combines all three)
  -> stored in services/state.py, served to the frontend by the routes below.

Run: python app.py   (from inside backend/)
"""

import time

from flask import Flask
from flask_cors import CORS

from config import Config
from services.state import state
from services.overall_risk import calculate_overall_risk
from utils.helpers import average_speed_kmh, time_to_collision_seconds

from modules.person1.simulator import simulator
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

# --- Weather is cached and refreshed periodically instead of on every tick,
#     since it's an external network call and conditions change slowly. ---
_weather_cache = {"data": None, "fetched_at": 0}
WEATHER_REFRESH_SECONDS = 120


def _get_weather_cached():
    now = time.time()
    if _weather_cache["data"] is None or (now - _weather_cache["fetched_at"]) > WEATHER_REFRESH_SECONDS:
        _weather_cache["data"] = get_current_weather()
        _weather_cache["fetched_at"] = now
    return _weather_cache["data"]


def simulation_tick():
    """One full Person1 -> Person2 -> Person3 -> Overall Risk cycle."""
    vehicles = simulator.tick()

    risk_events, accident_risk_score = compute_accident_risk(vehicles)

    avg_speed = average_speed_kmh(vehicles)
    density = calculate_traffic_density(len(vehicles), Config.ROAD_CAPACITY)
    congestion = calculate_congestion(len(vehicles), density["density_ratio"], avg_speed)

    weather = _get_weather_cached()
    road_condition = calculate_road_condition(weather)
    time_context = get_time_of_day()
    signal = signal_controller.tick()

    external_risk = calculate_external_risk(congestion, road_condition, weather, time_context, signal)

    overall = calculate_overall_risk(
        accident_risk_score=accident_risk_score,
        external_risk_score=external_risk["external_risk_score"],
        vehicle_density_ratio=density["density_ratio"],
    )

    traffic_context = {
        "density": density,
        "congestion": congestion,
        "weather": weather,
        "road_condition": road_condition,
        "time_context": time_context,
        "signal": signal,
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


# Run one tick immediately so the very first API call has real data,
# then start the background loop.
simulation_tick()
state.start(simulation_tick)


if __name__ == "__main__":
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, use_reloader=False)
