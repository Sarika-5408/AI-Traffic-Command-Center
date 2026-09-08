def generate_traffic_command(overall_risk_score, overall_risk_level, accident_risk_score):
    if accident_risk_score >= 80 or overall_risk_score > 80:
        return {
            "command": "HOLD_RED",
            "reason": "Critical accident risk detected",
            "priority": "CRITICAL",
        }

    if overall_risk_score > 60:
        return {
            "command": "EXTEND_GREEN",
            "reason": "High traffic risk detected",
            "priority": "HIGH",
        }

    if overall_risk_score > 30:
        return {
            "command": "MONITOR",
            "reason": "Moderate traffic risk detected",
            "priority": "MEDIUM",
        }

    return {
        "command": "NORMAL_CYCLE",
        "reason": "Traffic conditions are normal",
        "priority": "LOW",
    }
