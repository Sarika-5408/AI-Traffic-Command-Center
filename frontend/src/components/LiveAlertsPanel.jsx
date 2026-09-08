import React from "react";
import "./LiveAlertsPanel.css";

const LEVEL_COLOR = {
  LOW: "var(--status-low)",
  MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)",
  CRITICAL: "var(--status-critical)",
};

export default function LiveAlertsPanel({ alerts = [] }) {
  return (
    <div className="panel live-alerts-panel">
      <div className="panel-header"><span>LIVE ALERTS</span></div>

      {alerts.length === 0 && (
        <div className="alerts-empty">No active alerts {"\u2014"} junction is currently clear.</div>
      )}

      <div className="alerts-list">
        {alerts.slice(0, 6).map((a) => {
          const color = LEVEL_COLOR[a.risk_level] || LEVEL_COLOR.LOW;
          return (
            <div className="alert-row" key={a.event_id} style={{ borderLeftColor: color }}>
              <div className="alert-row-top">
                <span className="alert-title" style={{ color }}>{a.title}</span>
                <span className="alert-time">{a.time}</span>
              </div>
              <div className="alert-row-sub">
                {a.location} &middot; {a.vehicles.join(", ")} &middot; Risk {a.risk_score}
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 6 && (
        <button type="button" className="alerts-view-all">View All Alerts {"\u2192"}</button>
      )}
    </div>
  );
}
