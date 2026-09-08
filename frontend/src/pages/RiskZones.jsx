import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import RiskZoneMap from "../components/RiskZoneMap.jsx";
import "./RiskZones.css";

function RiskZonesContent() {
  // Data source: overall_risk (combining Person 1 + 2 + 3) from the shared
  // /api/dashboard payload.
  const { dashboard } = useDashboardContext();
  const overallRisk = dashboard?.overall_risk || {};
  const inputs = overallRisk.inputs || {};
  const weights = overallRisk.weights || {};

  return (
    <div className="grid-row grid-row--2">
      <RiskZoneMap
        junctionId={dashboard?.junction_id}
        junctionName={dashboard?.junction_name}
        riskLevel={overallRisk.overall_risk_level || "LOW"}
      />

      <div className="panel">
        <div className="panel-header"><span>OVERALL RISK BREAKDOWN</span></div>
        <div className="rz-score">
          <span className="rz-score-value">{overallRisk.overall_risk_score ?? 0}%</span>
          <span className="rz-score-level">{overallRisk.overall_risk_level || "LOW"} RISK</span>
        </div>

        <div className="rz-inputs">
          <div className="rz-input-row">
            <span>Accident Risk (Person 2)</span>
            <strong>{inputs.accident_risk_score ?? 0}</strong>
            <span className="rz-weight">weight {Math.round((weights.accident_risk || 0) * 100)}%</span>
          </div>
          <div className="rz-input-row">
            <span>External Risk (Person 3)</span>
            <strong>{inputs.external_risk_score ?? 0}</strong>
            <span className="rz-weight">weight {Math.round((weights.external_risk || 0) * 100)}%</span>
          </div>
          <div className="rz-input-row">
            <span>Vehicle Volume (Person 1)</span>
            <strong>{inputs.vehicle_volume_score ?? 0}</strong>
            <span className="rz-weight">weight {Math.round((weights.vehicle_volume || 0) * 100)}%</span>
          </div>
        </div>

        <p className="rz-note">
          Accident risk is weighted highest since it reflects real, currently-occurring
          near-miss/braking/swerving events. External risk (traffic + environmental
          conditions) is weighted second. Raw vehicle volume gets the smallest weight
          since it already feeds into the congestion component of external risk.
        </p>
      </div>
    </div>
  );
}

export default function RiskZones() {
  return (
    <AppLayout title="Risk Zones" subtitle="Monitored junctions and the overall risk combination formula">
      <RiskZonesContent />
    </AppLayout>
  );
}
