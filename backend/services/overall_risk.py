"""
services/overall_risk.py

Combines Person 1 (vehicle/traffic volume), Person 2 (accident/near-miss
risk) and Person 3 (traffic + environmental context risk) into one final
"Overall Risk Level" for the junction, as shown in the Dashboard reference
image's top-right "OVERALL RISK LEVEL" panel.

Weighting rationale (documented per project requirement #14 — not a blind
average):
  - Person 2 accident risk   (55%) -> the most direct, immediate signal:
      actual near-misses / hard braking / swerving happening right now.
  - Person 3 external risk   (30%) -> conditions that make a future accident
      more or less likely (congestion, weather, road, signal, time of day).
  - Person 1 volume factor   (15%) -> raw vehicle density is already a major
      *input* to Person 3's congestion score, so it is intentionally given
      the smallest independent weight here to avoid double-counting it —
      it still nudges the overall score up when the junction is simply busy.
"""


def _risk_level(score):
    if score <= 30:
        return "LOW"
    if score <= 60:
        return "MEDIUM"
    if score <= 80:
        return "HIGH"
    return "CRITICAL"


def calculate_overall_risk(accident_risk_score, external_risk_score, vehicle_density_ratio):
    volume_sub = round(min(100, vehicle_density_ratio * 100))

    weighted = (
        accident_risk_score * 0.55 +
        external_risk_score * 0.30 +
        volume_sub * 0.15
    )
    score = round(max(0, min(100, weighted)))

    return {
        "overall_risk_score": score,
        "overall_risk_level": _risk_level(score),
        "inputs": {
            "accident_risk_score": accident_risk_score,
            "external_risk_score": external_risk_score,
            "vehicle_volume_score": volume_sub,
        },
        "weights": {
            "accident_risk": 0.55,
            "external_risk": 0.30,
            "vehicle_volume": 0.15,
        },
    }
