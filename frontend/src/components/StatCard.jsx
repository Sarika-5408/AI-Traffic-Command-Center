import React from "react";
import Sparkline from "./Sparkline.jsx";
import "./StatCard.css";

export default function StatCard({ icon, label, value, unit, subtitle, color = "var(--cyan)", history = [] }) {
  return (
    <div className="stat-card" style={{ "--accent": color }}>
      <div className="stat-card-top">
        <div className="stat-card-icon">{icon}</div>
        <div className="stat-card-label">{label}</div>
      </div>
      <div className="stat-card-value">
        {value}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      <div className="stat-card-spark">
        <Sparkline values={history.length ? history : [0]} color={color} height={26} />
      </div>
    </div>
  );
}
