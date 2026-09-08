"""
modules/person3/weather_service.py

PERSON 3 — Weather.

Uses Open-Meteo (https://open-meteo.com) because it requires no API key,
which keeps this college project simple to run for anyone who clones it.
If the request fails for any reason (no internet, API down, timeout), a
safe fallback weather reading is returned instead of raising — the system
must never crash because of a third-party API.
"""

import requests

from config import Config

FALLBACK_WEATHER = {
    "condition": "CLEAR",
    "temperature_c": 30,
    "visibility": "GOOD",
    "rainfall_mm": 0,
    "wind_kmh": 8,
    "source": "fallback",
}

_WEATHER_CODE_MAP = {
    # Open-Meteo WMO weather codes -> simplified condition label
    0: "CLEAR", 1: "CLEAR", 2: "PARTLY_CLOUDY", 3: "CLOUDY",
    45: "FOG", 48: "FOG",
    51: "DRIZZLE", 53: "DRIZZLE", 55: "DRIZZLE",
    61: "RAIN", 63: "RAIN", 65: "HEAVY_RAIN",
    71: "SNOW", 73: "SNOW", 75: "HEAVY_SNOW",
    80: "RAIN_SHOWERS", 81: "RAIN_SHOWERS", 82: "HEAVY_RAIN",
    95: "THUNDERSTORM", 96: "THUNDERSTORM", 99: "THUNDERSTORM",
}


def get_current_weather(lat=None, lon=None):
    lat = lat if lat is not None else Config.WEATHER_LAT
    lon = lon if lon is not None else Config.WEATHER_LON

    try:
        response = requests.get(
            Config.WEATHER_API_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,precipitation,wind_speed_10m,weather_code",
                "timezone": "auto",
            },
            timeout=Config.WEATHER_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json().get("current", {})

        code = data.get("weather_code", 0)
        condition = _WEATHER_CODE_MAP.get(code, "CLEAR")
        rainfall = data.get("precipitation", 0) or 0

        visibility = "GOOD"
        if condition in ("FOG",):
            visibility = "POOR"
        elif condition in ("RAIN", "HEAVY_RAIN", "RAIN_SHOWERS", "THUNDERSTORM", "SNOW", "HEAVY_SNOW"):
            visibility = "MODERATE"

        return {
            "condition": condition,
            "temperature_c": round(data.get("temperature_2m", FALLBACK_WEATHER["temperature_c"]), 1),
            "visibility": visibility,
            "rainfall_mm": rainfall,
            "wind_kmh": round(data.get("wind_speed_10m", FALLBACK_WEATHER["wind_kmh"]), 1),
            "source": "open-meteo",
        }

    except Exception as exc:  # network error, timeout, bad response, etc.
        print(f"[weather_service] falling back — {exc}")
        return dict(FALLBACK_WEATHER)
