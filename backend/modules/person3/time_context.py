"""
modules/person3/time_context.py

PERSON 3 — Time of Day.

MORNING 05:00-11:59 | AFTERNOON 12:00-16:59 | EVENING 17:00-20:59 | NIGHT 21:00-04:59

Also flags known local peak-traffic windows, used as a factor in the
external risk score.
"""

from datetime import datetime

PEAK_WINDOWS = [(8, 10), (17, 20)]  # 8-10am and 5-8pm


def get_time_of_day(now=None):
    now = now or datetime.now()
    hour = now.hour

    if 5 <= hour < 12:
        bucket = "MORNING"
    elif 12 <= hour < 17:
        bucket = "AFTERNOON"
    elif 17 <= hour < 21:
        bucket = "EVENING"
    else:
        bucket = "NIGHT"

    is_peak = any(start <= hour < end for start, end in PEAK_WINDOWS)

    return {
        "time_of_day": bucket,
        "is_peak_hour": is_peak,
        "current_time": now.strftime("%I:%M:%S %p"),
        "current_date": now.strftime("%d %b %Y"),
    }
