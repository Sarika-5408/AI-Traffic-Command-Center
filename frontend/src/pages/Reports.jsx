import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import "./Reports.css";

function formatUptime(seconds = 0) {
  const s = Math.floor(seconds);
  const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const secs = String(s % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function ReportsContent() {
  // Built from the same live /api/dashboard snapshot every other page
  // uses. There is no persistent-storage/history endpoint in this project
  // (see README §0), so this is an honest live session snapshot rather
  // than a fabricated historical report.
  const { dashboard, alerts } = useDashboardContext();
  const vehicles = dashboard?.vehicles || { count: 0, by_type: {} };
  const risk = dashboard?.risk || {};
  const ctx = dashboard?.traffic_context || {};
  const overall = dashboard?.overall_risk || {};

  const rows = [
    { label: "Junction", value: dashboard?.junction_name || "-" },
    { label: "Session uptime", value: formatUptime(dashboard?.uptime_seconds) },
    { label: "Frames processed", value: dashboard?.frame ?? "-" },
    { label: "Vehicles currently tracked", value: vehicles.count },
    { label: "Near-miss events (recent)", value: risk.near_miss_count ?? 0 },
    { label: "Active alerts", value: alerts?.count ?? 0 },
    { label: "Accident risk score", value: `${risk.accident_risk_score ?? 0}/100` },
    { label: "External risk score", value: `${ctx.external_risk?.external_risk_score ?? 0}/100` },
    { label: "Overall risk level", value: `${overall.overall_risk_level || "-"} (${overall.overall_risk_score ?? 0}%)` },
    { label: "Weather", value: (ctx.weather?.condition || "-").replace(/_/g, " ") },
    { label: "Road condition", value: ctx.road_condition?.road_condition || "-" },
    { label: "Signal state", value: ctx.signal?.signal_state || "-" },
  ];

  return (
    <div className="panel">
      <div className="panel-header"><span>SESSION SUMMARY</span></div>
      <p className="rep-note">
        A live snapshot of the current monitoring session. Extended historical
        reporting (trends over days/weeks) would require persistent storage,
        which this simulated demo project does not include.
      </p>
      <div className="rep-grid">
        {rows.map((r) => (
          <div className="rep-row" key={r.label}>
            <span className="rep-label">{r.label}</span>
            <span className="rep-value">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <AppLayout title="Reports" subtitle="Live session summary">
      <ReportsContent />
    </AppLayout>
  );
}
