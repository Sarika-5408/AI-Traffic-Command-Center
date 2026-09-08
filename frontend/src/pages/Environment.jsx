import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import { WeatherPanel, RoadConditionPanel, TimePanel } from "../components/EnvironmentPanels.jsx";
import "./Environment.css";

function EnvironmentContent() {
  // Data source: GET /api/weather, GET /api/road-condition (via the shared
  // /api/dashboard payload's traffic_context — Person 3's output).
  const { dashboard } = useDashboardContext();
  const ctx = dashboard?.traffic_context || {};
  const external = ctx.external_risk || {};
  const factors = external.factors || {};
  const weights = external.weights || {};

  const FACTOR_LABELS = {
    congestion: "Congestion", road_condition: "Road Condition",
    weather: "Weather", time_of_day: "Time of Day", signal: "Signal State",
  };

  return (
    <>
      <div className="grid-row grid-row--3">
        <WeatherPanel weather={ctx.weather} />
        <RoadConditionPanel road={ctx.road_condition} />
        <TimePanel time={ctx.time_context} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <span>EXTERNAL RISK SCORE</span>
          <span className="env-score">{external.external_risk_score ?? 0}% &mdash; {external.external_risk_level || "LOW"}</span>
        </div>
        <div className="env-factors">
          {Object.entries(factors).map(([key, value]) => (
            <div className="env-factor-row" key={key}>
              <span className="env-factor-label">{FACTOR_LABELS[key] || key}</span>
              <div className="env-factor-track">
                <div className="env-factor-fill" style={{ width: `${value}%` }} />
              </div>
              <span className="env-factor-value">{value}%</span>
              <span className="env-factor-weight">&times;{Math.round((weights[key] || 0) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Environment() {
  return (
    <AppLayout title="Environment" subtitle="Weather, road condition, time-of-day and the external risk formula (Person 3)">
      <EnvironmentContent />
    </AppLayout>
  );
}
