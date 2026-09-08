"""
modules/person3/risk_calculator.py

PERSON 3 — External Risk Score.

Combines traffic-context and environmental factors into a single 0-100
external risk score. This score represents "how risky the *conditions* are",
independent of any specific accident/near-miss event (that's Person 2's job).

Weighting rationale (documented, not just averaged blindly):
  - Congestion (35%)   -> most direct traffic-context driver of collisions
                          (stop-and-go traffic, tailgating).
  - Road condition (25%) -> wet/hazardous surfaces directly reduce vehicle
                          control and stopping distance.
  - Weather (20%)      -> visibility and rain both affect reaction time and
                          following distance, but overlaps partly with road
                          condition, hence a smaller independent weight.
  - Time of day (10%)  -> peak hours and night driving carry modestly higher
                          baseline risk (fatigue, visibility, volume).
  - Signal state (10%) -> a RED/YELLOW transition window carries slightly
                          more risk (last-second crossings) than steady GREEN.

Each factor is first mapped to a 0-100 sub-score, then combined with the
weights above.
"""

_LEVEL_SCORES = {
    "LOW": 15, "GOOD": 10, "CLEAR": 5,
    "MEDIUM": 45, "FAIR": 40,
    "HIGH": 70, "POOR": 70,
    "CRITICAL": 92, "HAZARDOUS": 95,
}

_WEATHER_CONDITION_SCORE = {
    "CLEAR": 5, "PARTLY_CLOUDY": 15, "CLOUDY": 20,
    "DRIZZLE": 35, "FOG": 55,
    "RAIN": 55, "RAIN_SHOWERS": 55,
    "HEAVY_RAIN": 80, "SNOW": 70, "HEAVY_SNOW": 90,
    "THUNDERSTORM": 95,
}

_SIGNAL_SCORE = {"GREEN": 15, "YELLOW": 55, "RED": 25}


def _risk_level(score):
    if score <= 30:
        return "LOW"
    if score <= 60:
        return "MEDIUM"
    if score <= 80:
        return "HIGH"
    return "CRITICAL"


def calculate_external_risk(congestion, road_condition, weather, time_context, signal):
    congestion_sub = congestion.get("congestion_score", 30)
    road_sub = _LEVEL_SCORES.get(road_condition.get("road_condition", "GOOD"), 20)
    weather_sub = _WEATHER_CONDITION_SCORE.get(weather.get("condition", "CLEAR"), 20)

    time_sub = 20
    if time_context.get("time_of_day") == "NIGHT":
        time_sub += 25
    if time_context.get("is_peak_hour"):
        time_sub += 25
    time_sub = min(100, time_sub)

    signal_sub = _SIGNAL_SCORE.get(signal.get("signal_state", "GREEN"), 20)

    weighted = (
        congestion_sub * 0.35 +
        road_sub * 0.25 +
        weather_sub * 0.20 +
        time_sub * 0.10 +
        signal_sub * 0.10
    )
    score = round(max(0, min(100, weighted)))

    return {
        "external_risk_score": score,
        "external_risk_level": _risk_level(score),
        "factors": {
            "congestion": congestion_sub,
            "road_condition": road_sub,
            "weather": weather_sub,
            "time_of_day": time_sub,
            "signal": signal_sub,
        },
        "weights": {
            "congestion": 0.35,
            "road_condition": 0.25,
            "weather": 0.20,
            "time_of_day": 0.10,
            "signal": 0.10,
        },
    }
