import React from "react";
import "./AIRecommendationPanel.css";

/**
 * Generates short, rule-based recommendation lines from the current traffic
 * context. Deterministic and explainable (not a black-box call) — suitable
 * for a college project where every output must be traceable to real data.
 */
function buildRecommendations(ctx, overallLevel) {
  const lines = [];
  if (!ctx) return ["Monitoring traffic \u2014 no significant risk factors detected yet."];

  const density = ctx.density?.density_level;
  const congestion = ctx.congestion?.congestion_level;
  const road = ctx.road_condition?.road_condition;
  const weather = ctx.weather?.condition;
  const signal = ctx.signal?.signal_state;

  if (density === "HIGH" || density === "CRITICAL") {
    lines.push(`${density} vehicle density detected. Maintain current signal timing and monitor closely.`);
  }
  if (congestion === "HIGH" || congestion === "CRITICAL") {
    lines.push("Congestion is building — consider extending green-phase duration.");
  }
  if (road === "POOR" || road === "HAZARDOUS") {
    lines.push(`Road surface is ${road.toLowerCase()}. Advise reduced speed limits at this junction.`);
  }
  if (weather && weather !== "CLEAR") {
    lines.push(`Weather condition (${weather.replace(/_/g, " ").toLowerCase()}) may reduce visibility — increase following-distance alerts.`);
  }
  if (signal === "YELLOW") {
    lines.push("Signal in transition — watch for last-second crossings.");
  }
  if (lines.length === 0) {
    lines.push("Conditions are normal. Continue standard monitoring.");
  }
  lines.push("Monitor TTC and vehicle movement closely.");
  return lines;
}

export default function AIRecommendationPanel({ trafficContext, overallLevel, confidence }) {
  const lines = buildRecommendations(trafficContext, overallLevel);

  return (
    <div className="panel ai-rec-panel">
      <div className="panel-header"><span>AI RECOMMENDATION</span></div>
      <div className="ai-rec-icon">AI</div>
      <ul className="ai-rec-list">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <div className="ai-rec-confidence-label">Confidence: {confidence}%</div>
      <div className="ai-rec-confidence-track">
        <div className="ai-rec-confidence-fill" style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}
