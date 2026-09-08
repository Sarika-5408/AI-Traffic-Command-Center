import React from "react";
import "./RiskPredictionPanel.css";

const RISK_COLOR = {
  LOW: "var(--status-low)",
  MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)",
  CRITICAL: "var(--status-critical)",
};

function riskLevel(score) {
  if (score <= 30) return "LOW";
  if (score <= 60) return "MEDIUM";
  if (score <= 80) return "HIGH";
  return "CRITICAL";
}

export default function RiskPredictionPanel({ accidentRiskScore = 0, factors = [] }) {
  const level = riskLevel(accidentRiskScore);
  const color = RISK_COLOR[level];
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - accidentRiskScore / 100);

  return (
    <div className="panel risk-prediction-panel">
      <div className="panel-header"><span>AI RISK PREDICTION</span></div>

      <div className="risk-gauge">
        <svg viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="52" className="risk-gauge-track" />
          <circle
            cx="65" cy="65" r="52"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 65 65)"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="risk-gauge-center">
          <div className="risk-gauge-score" style={{ color }}>{accidentRiskScore}%</div>
          <div className="risk-gauge-level" style={{ color }}>{level} RISK</div>
          <div className="risk-gauge-caption">Accident Probability</div>
        </div>
      </div>

      <div className="risk-factors">
        <div className="risk-factors-title">RISK FACTORS</div>
        {factors.map((f) => (
          <div className="risk-factor-row" key={f.label}>
            <span className="risk-factor-label">{f.label}</span>
            <div className="risk-factor-bar-track">
              <div
                className="risk-factor-bar-fill"
                style={{ width: `${f.value}%`, background: f.color || "var(--cyan)" }}
              />
            </div>
            <span className="risk-factor-value">{f.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
