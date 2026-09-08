"""
Central configuration for the AI Traffic Command Center backend.
"""

import os


class Config:
    # --- Server ---
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("DEBUG", "True") == "True"

    # --- Junction ---
    JUNCTION_ID = "JUNCTION_1"
    JUNCTION_NAME = "Main City Junction"

    # --- Person 3: Traffic density ---
    ROAD_CAPACITY = int(os.environ.get("ROAD_CAPACITY", 40))  # max comfortable vehicles in frame

    # --- Person 3: Weather ---
    # Open-Meteo requires no API key. If unreachable, weather.py falls back safely.
    WEATHER_LAT = float(os.environ.get("WEATHER_LAT", 13.0827))   # Chennai default
    WEATHER_LON = float(os.environ.get("WEATHER_LON", 80.2707))
    WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
    WEATHER_TIMEOUT_SECONDS = 4

    # --- Person 2: Risk thresholds ---
    NEAR_MISS_DISTANCE_THRESHOLD_PX = 90
    SUDDEN_BRAKE_DROP_RATIO = 0.35   # >=35% speed drop between frames flags hard braking
    SUDDEN_SWERVE_ANGLE_DEG = 35     # heading change >= this flags a swerve

    # --- Simulation refresh ---
    SIMULATION_FRAME_INTERVAL_SECONDS = 1.5
