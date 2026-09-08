import React, { useEffect, useState } from "react";
import Sparkline from "./Sparkline.jsx";
import "./Header.css";

const RISK_COLOR = {
  LOW: "var(--status-low)",
  MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)",
  CRITICAL: "var(--status-critical)",
};

export default function Header({ junctionName, isLive, overallRisk, riskHistory }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const level = overallRisk?.overall_risk_level || "LOW";
  const score = overallRisk?.overall_risk_score ?? 0;
  const color = RISK_COLOR[level] || RISK_COLOR.LOW;

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-brand-icon">AI</div>
        <div>
          <div className="header-title">TRAFFIC GUARD</div>
          <div className="header-subtitle">AI POWERED TRAFFIC MONITORING &amp; ACCIDENT RISK PREDICTION SYSTEM</div>
        </div>
      </div>

      <div className="header-pill">
        <div className="header-pill-label">SYSTEM STATUS</div>
        <div className={`header-pill-value ${isLive ? "status-online" : "status-offline"}`}>
          <span className="status-dot" /> {isLive ? "ONLINE" : "RECONNECTING"}
        </div>
        <div className="header-pill-sub">{isLive ? "All Systems Operational" : "Using cached data"}</div>
      </div>

      <div className="header-pill">
        <div className="header-pill-label">LOCATION</div>
        <div className="header-pill-value">{junctionName || "Main City Junction"}</div>
      </div>

      <div className="header-pill">
        <div className="header-pill-label">TIME &amp; DATE</div>
        <div className="header-pill-value header-mono">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className="header-pill-sub">
          {now.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="header-brain">AI</div>

      <div className="header-risk-panel" style={{ borderColor: color }}>
        <div className="header-pill-label">OVERALL RISK LEVEL</div>
        <div className="header-risk-row">
          <span className="header-risk-level" style={{ color }}>{level}</span>
          <span className="header-risk-score">{score}%</span>
        </div>
        <Sparkline values={riskHistory.length ? riskHistory : [score]} color={color} height={26} />
      </div>
    </header>
  );
}
