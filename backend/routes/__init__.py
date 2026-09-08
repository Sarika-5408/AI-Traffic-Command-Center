"""
routes/__init__.py

Registers every route blueprint on the ONE Flask app created in app.py.
There is intentionally a single Flask application for the whole project —
Person 3's old standalone app.py (if any existed) must be merged in here,
not run separately.
"""


def register_routes(app):
    from .health import health_bp
    from .vehicles import vehicles_bp
    from .risk import risk_bp
    from .traffic import traffic_bp
    from .dashboard import dashboard_bp
    from .alerts import alerts_bp
    from .weather import weather_bp
    from .road_condition import road_condition_bp
    from .traffic_signal import traffic_signal_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(traffic_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(road_condition_bp)
    app.register_blueprint(traffic_signal_bp)
