import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import RiskPredictionPanel from "../components/RiskPredictionPanel.jsx";
import "./RiskPrediction.css";

const LEVEL_COLOR = {
  LOW: "var(--status-low)", MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)", CRITICAL: "var(--status-critical)",
};

function RiskPredictionContent() {
  // Data source: GET /api/risk (via the shared /api/dashboard payload's
  // `risk` block — Person 2's near-miss / braking / swerving output).
  const { dashboard } = useDashboardContext();
  const risk = dashboard?.risk || {};
  const ctx = dashboard?.traffic_context || {};

  const riskFactors = [
    { label: "Vehicle Density", value: Math.round((ctx.density?.density_ratio || 0) * 100), color: "var(--cyan)" },
    { label: "Congestion", value: ctx.congestion?.congestion_score || 0, color: "var(--purple)" },
    { label: "TTC Critical", value: Math.max(0, Math.round(100 - ((risk.ttc_seconds || 15) / 15) * 100)), color: "var(--status-critical)" },
    { label: "Weather Condition", value: ctx.external_risk?.factors?.weather || 0, color: "var(--blue)" },
    { label: "Road Condition", value: ctx.external_risk?.factors?.road_condition || 0, color: "var(--status-medium)" },
  ];

  return (
    <div className="grid-row grid-row--2">
      <RiskPredictionPanel accidentRiskScore={risk.accident_risk_score || 0} factors={riskFactors} />

      <div className="panel">
        <div className="panel-header">
          <span>RECENT RISK EVENTS</span>
          <span className="rp-count">{risk.recent_events?.length || 0} events</span>
        </div>
        <div className="event-list">
          {(!risk.recent_events || risk.recent_events.length === 0) && (
            <div className="rp-empty">No risk events detected recently &mdash; junction is clear.</div>
          )}
          {(risk.recent_events || []).map((e) => {
            const color = LEVEL_COLOR[e.risk_level] || LEVEL_COLOR.LOW;
            return (
              <div className="event-row" key={e.event_id} style={{ borderLeftColor: color }}>
                <div className="event-row-top">
                  <span className="event-type" style={{ color }}>{e.type.replace(/_/g, " ")}</span>
                  <span className="event-score" style={{ color }}>{e.risk_score}</span>
                </div>
                <div className="event-row-sub">
                  {e.location} &middot; Vehicles: {e.vehicles.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RiskPrediction() {
  return (
    <AppLayout title="Risk Prediction" subtitle="Person 2 — accident risk scoring and recent risk events">
      <RiskPredictionContent />
    </AppLayout>
  );
}
