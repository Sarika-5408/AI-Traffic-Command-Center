import React from "react";
import "./RiskZoneMap.css";

const RISK_COLOR = {
  LOW: "var(--status-low)",
  MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)",
  CRITICAL: "var(--status-critical)",
};

/**
 * Risk Zone Map.
 *
 * Only ONE junction (JUNCTION_1) has a live camera/detector feed in this
 * project, so only that junction's risk is real. Rather than inventing risk
 * levels for neighbouring junctions (which the reference image shows but
 * this system does not actually monitor), this renders the single
 * monitored zone accurately and clearly labels it as the only live feed —
 * additional zones can be added here once more cameras/detectors exist.
 */
export default function RiskZoneMap({ junctionId, junctionName, riskLevel = "LOW" }) {
  const color = RISK_COLOR[riskLevel] || RISK_COLOR.LOW;

  return (
    <div className="panel risk-zone-panel">
      <div className="panel-header"><span>RISK ZONE MAP</span></div>
      <div className="risk-zone-canvas">
        <svg viewBox="0 0 300 220">
          <line x1="0" y1="110" x2="300" y2="110" stroke="rgba(148,163,184,0.15)" strokeWidth="18" />
          <line x1="150" y1="0" x2="150" y2="220" stroke="rgba(148,163,184,0.15)" strokeWidth="18" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx="150" cy="110" r={20 + i * 14} fill="none" stroke={color} strokeOpacity={0.12} />
          ))}
          <circle cx="150" cy="110" r="12" fill={color} opacity="0.9" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
        </svg>
        <div className="risk-zone-label" style={{ color }}>
          <div className="risk-zone-id">{junctionId}</div>
          <div className="risk-zone-level">{riskLevel} RISK</div>
        </div>
      </div>
      <div className="risk-zone-note">
        {junctionName} is the only zone with a live feed connected. Additional junctions can be added once more detectors are deployed.
      </div>
    </div>
  );
}
