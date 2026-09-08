"""
modules/person3/traffic_context.py

PERSON 3 — Traffic Density & Congestion.

density_ratio = vehicle_count / road_capacity
  0.00-0.30 LOW | 0.31-0.60 MEDIUM | 0.61-0.80 HIGH | 0.81-1.00 CRITICAL

Congestion level is derived from density plus average speed: the same
vehicle count is far more congested if vehicles are moving slowly than if
they are flowing freely.
"""

from config import Config


def _density_level(ratio):
    if ratio <= 0.30:
        return "LOW"
    if ratio <= 0.60:
        return "MEDIUM"
    if ratio <= 0.80:
        return "HIGH"
    return "CRITICAL"


def calculate_traffic_density(vehicle_count, road_capacity=None):
    road_capacity = road_capacity or Config.ROAD_CAPACITY
    ratio = min(1.0, vehicle_count / road_capacity) if road_capacity else 0
    return {
        "vehicle_count": vehicle_count,
        "road_capacity": road_capacity,
        "density_ratio": round(ratio, 2),
        "density_level": _density_level(ratio),
    }


def calculate_congestion(vehicle_count, density_ratio, average_speed_kmh):
    """
    Congestion blends density with how slowly traffic is actually moving.
    A high density_ratio with low average speed is worse than the same
    density with free-flowing traffic.
    """
    # Normalize average speed against a comfortable free-flow speed (50 km/h)
    speed_factor = max(0.0, min(1.0, 1 - (average_speed_kmh / 50)))
    congestion_score = round((density_ratio * 0.6 + speed_factor * 0.4) * 100)
    congestion_score = max(0, min(100, congestion_score))

    if congestion_score <= 30:
        level = "LOW"
    elif congestion_score <= 60:
        level = "MEDIUM"
    elif congestion_score <= 80:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return {
        "congestion_score": congestion_score,
        "congestion_level": level,
        "average_speed_kmh": round(average_speed_kmh, 1),
    }
