import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import { useRollingHistory } from "../hooks/useRollingHistory.js";
import AppLayout from "../components/AppLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import LiveTrafficFeed from "../components/LiveTrafficFeed.jsx";
import RiskPredictionPanel from "../components/RiskPredictionPanel.jsx";
import { WeatherPanel, RoadConditionPanel, TimePanel } from "../components/EnvironmentPanels.jsx";
import RiskZoneMap from "../components/RiskZoneMap.jsx";
import LiveAlertsPanel from "../components/LiveAlertsPanel.jsx";
import SignalControlPanel from "../components/SignalControlPanel.jsx";
import AIRecommendationPanel from "../components/AIRecommendationPanel.jsx";

function DashboardContent() {
  const { dashboard, alerts, isLive } = useDashboardContext();

  const overallRisk = dashboard?.overall_risk || {};
  const trafficContext = dashboard?.traffic_context || {};
  const vehicles = dashboard?.vehicles || { count: 0, list: [] };
  const risk = dashboard?.risk || {};

  const vehicleHistory = useRollingHistory(vehicles.count);
  const densityHistory = useRollingHistory(trafficContext.density?.density_ratio ? trafficContext.density.density_ratio * 100 : undefined);
  const congestionHistory = useRollingHistory(trafficContext.congestion?.congestion_score);
  const riskScoreHistory = useRollingHistory(risk.accident_risk_score);
  const ttcHistory = useRollingHistory(risk.ttc_seconds);
  const nearMissHistory = useRollingHistory(risk.near_miss_count);

  const riskFactors = [
    { label: "Vehicle Density", value: Math.round((trafficContext.density?.density_ratio || 0) * 100), color: "var(--cyan)" },
    { label: "Congestion", value: trafficContext.congestion?.congestion_score || 0, color: "var(--purple)" },
    { label: "TTC Critical", value: Math.max(0, Math.round(100 - ((risk.ttc_seconds || 15) / 15) * 100)), color: "var(--status-critical)" },
    { label: "Weather Condition", value: trafficContext.external_risk?.factors?.weather || 0, color: "var(--blue)" },
    { label: "Road Condition", value: trafficContext.external_risk?.factors?.road_condition || 0, color: "var(--status-medium)" },
  ];

  const confidence = Math.max(60, Math.round(100 - (risk.accident_risk_score || 0) / 5));

  return (
    <>
      <div className="stat-row">
        <StatCard icon={"\u{1F697}"} label="VEHICLE COUNT" value={vehicles.count} unit="vehicles"
          color="var(--status-low)" history={vehicleHistory} />
        <StatCard icon={"\u{1F6E3}"} label="TRAFFIC DENSITY" value={trafficContext.density?.density_ratio ?? "-"}
          subtitle={trafficContext.density?.density_level} color="var(--cyan)" history={densityHistory} />
        <StatCard icon={"\u{1F6A8}"} label="CONGESTION LEVEL" value={trafficContext.congestion?.congestion_level || "-"}
          subtitle={`${trafficContext.congestion?.congestion_score ?? 0}%`} color="var(--status-medium)" history={congestionHistory} />
        <StatCard icon={"\u{1F6E1}"} label="RISK SCORE" value={risk.accident_risk_score ?? 0} unit="/100"
          subtitle="Accident Risk" color="var(--status-critical)" history={riskScoreHistory} />
        <StatCard icon={"\u23F1"} label="TTC (TIME TO COLLISION)" value={risk.ttc_seconds ?? "-"} unit="sec"
          color="var(--purple)" history={ttcHistory} />
        <StatCard icon={"\u26A0"} label="NEAR-MISS ALERTS" value={risk.near_miss_count ?? 0}
          subtitle="Detected" color="var(--magenta)" history={nearMissHistory} />
      </div>

      <div className="grid-row grid-row--3">
        <LiveTrafficFeed vehicles={vehicles.list} isLive={isLive} />
        <RiskPredictionPanel accidentRiskScore={risk.accident_risk_score || 0} factors={riskFactors} />
        <div className="env-stack">
          <WeatherPanel weather={trafficContext.weather} />
          <RoadConditionPanel road={trafficContext.road_condition} />
          <TimePanel time={trafficContext.time_context} />
        </div>
      </div>

      <div className="grid-row grid-row--4">
        <RiskZoneMap
          junctionId={dashboard?.junction_id}
          junctionName={dashboard?.junction_name}
          riskLevel={overallRisk.overall_risk_level || "LOW"}
        />
        <LiveAlertsPanel alerts={alerts?.alerts || []} />
        <SignalControlPanel signal={trafficContext.signal} />
        <AIRecommendationPanel
          trafficContext={trafficContext}
          overallLevel={overallRisk.overall_risk_level}
          confidence={confidence}
        />
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
