"""
modules/person3/road_condition.py

PERSON 3 — Road Condition.

Levels: GOOD, FAIR, POOR, HAZARDOUS

Derived from current weather, since this project has no physical road-surface
sensor. Heavy rain/snow/storms degrade surface friction and are treated as
HAZARDOUS; light rain/drizzle/fog as FAIR/POOR; clear weather as GOOD.
"""

_HAZARDOUS_CONDITIONS = {"HEAVY_RAIN", "HEAVY_SNOW", "THUNDERSTORM"}
_POOR_CONDITIONS = {"RAIN", "RAIN_SHOWERS", "SNOW", "FOG"}
_FAIR_CONDITIONS = {"DRIZZLE", "CLOUDY"}


def calculate_road_condition(weather):
    condition = weather.get("condition", "CLEAR")

    if condition in _HAZARDOUS_CONDITIONS:
        level = "HAZARDOUS"
        friction = "LOW"
    elif condition in _POOR_CONDITIONS:
        level = "POOR"
        friction = "MODERATE"
    elif condition in _FAIR_CONDITIONS:
        level = "FAIR"
        friction = "MODERATE"
    else:
        level = "GOOD"
        friction = "HIGH"

    surface = "WET" if level in ("POOR", "HAZARDOUS") else "DRY"

    return {
        "road_condition": level,
        "surface": surface,
        "friction": friction,
    }
