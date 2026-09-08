"""Small shared helper functions."""


def average_speed_kmh(vehicles):
    if not vehicles:
        return 0.0
    return sum(v["speed"] for v in vehicles) / len(vehicles)


def vehicle_count_by_type(vehicles):
    counts = {}
    for v in vehicles:
        counts[v["type"]] = counts.get(v["type"], 0) + 1
    return counts


def time_to_collision_seconds(accident_risk_score):
    """
    A simple, explainable inverse mapping used only for the Dashboard's
    "TTC (Time To Collision)" indicator: higher accident risk => lower
    (more urgent) estimated time-to-collision. Not a physics simulation —
    just a readable proxy consistent with the risk score.
    """
    if accident_risk_score <= 0:
        return 15.0
    ttc = max(0.5, 15 - (accident_risk_score / 100) * 13.5)
    return round(ttc, 1)
