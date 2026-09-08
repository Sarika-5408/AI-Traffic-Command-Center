import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import { useRollingHistory } from "../hooks/useRollingHistory.js";
import AppLayout from "../components/AppLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import Sparkline from "../components/Sparkline.jsx";
import "./TrafficAnalytics.css";

function TrafficAnalyticsContent() {
  // Data source: GET /api/traffic (via the shared /api/dashboard payload's
  // traffic_context, which is exactly Person 3's output).
  const { dashboard } = useDashboardContext();
  const ctx = dashboard?.traffic_context || {};
  const vehicles = dashboard?.vehicles || { count: 0, by_type: {} };

  const densityHistory = useRollingHistory(ctx.density ? ctx.density.density_ratio * 100 : undefined);
  const congestionHistory = useRollingHistory(ctx.congestion?.congestion_score);
  const speedHistory = useRollingHistory(ctx.average_speed_kmh);
  const vehicleHistory = useRollingHistory(vehicles.count);

  const maxTypeCount = Math.max(1, ...Object.values(vehicles.by_type || {}));

  return (
    <>
      <div className="stat-row">
        <StatCard icon={"\u{1F697}"} label="VEHICLE COUNT" value={vehicles.count} unit="vehicles"
          color="var(--status-low)" history={vehicleHistory} />
        <StatCard icon={"\u{1F6E3}"} label="DENSITY RATIO" value={ctx.density?.density_ratio ?? "-"}
          subtitle={ctx.density?.density_level} color="var(--cyan)" history={densityHistory} />
        <StatCard icon={"\u{1F6A8}"} label="CONGESTION" value={ctx.congestion?.congestion_level || "-"}
          subtitle={`${ctx.congestion?.congestion_score ?? 0}%`} color="var(--status-medium)" history={congestionHistory} />
        <StatCard icon={"\u{1F4C8}"} label="AVG SPEED" value={ctx.average_speed_kmh ?? "-"} unit="km/h"
          color="var(--purple)" history={speedHistory} />
      </div>

      <div className="grid-row grid-row--2">
        <div className="panel">
          <div className="panel-header"><span>VEHICLE MIX</span></div>
          <div className="mix-bars">
            {Object.entries(vehicles.by_type || {}).length === 0 && (
              <div className="ta-empty">No vehicle data yet.</div>
            )}
            {Object.entries(vehicles.by_type || {}).map(([type, count]) => (
              <div className="mix-row" key={type}>
                <span className="mix-label">{type.toUpperCase()}</span>
                <div className="mix-track">
                  <div className="mix-fill" style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                </div>
                <span className="mix-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
       <div className="grid-row grid-row--2">
        <div className="panel">
          <div className="panel-header"><span>ENVIRONMENT INTELLIGENCE</span></div>
          <div className="threshold-grid">
            <div className="threshold-item">
              <span>WEATHER</span>
              <strong>{ctx.weather?.condition || "-"}</strong>
              <span>{ctx.weather?.temperature_c ?? "-"}°C</span>
            </div>

            <div className="threshold-item">
              <span>ROAD CONDITION</span>
              <strong>{ctx.road_condition?.road_condition || "-"}</strong>
              <span>{ctx.road_condition?.surface || "-"}</span>
            </div>

            <div className="threshold-item">
              <span>TIME OF DAY</span>
              <strong>{ctx.time_context?.time_of_day || "-"}</strong>
              <span>{ctx.time_context?.is_peak_hour ? "PEAK HOUR" : "NON-PEAK"}</span>
            </div>

            <div className="threshold-item">
              <span>EXTERNAL RISK</span>
              <strong>{ctx.external_risk?.external_risk_level || "-"}</strong>
              <span>{ctx.external_risk?.external_risk_score ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>
        <div className="panel">
          <div className="panel-header"><span>DENSITY TREND</span></div>
          <div className="trend-chart">
            <Sparkline values={densityHistory.length ? densityHistory : [0]} color="var(--cyan)" height={90} />
          </div>
          <div className="trend-caption">Density ratio over recent polling cycles (%)</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><span>DENSITY THRESHOLDS</span></div>
        <div className="threshold-grid">
          <div className="threshold-item threshold-item--low"><span>0.00 – 0.30</span><strong>LOW</strong></div>
          <div className="threshold-item threshold-item--medium"><span>0.31 – 0.60</span><strong>MEDIUM</strong></div>
          <div className="threshold-item threshold-item--high"><span>0.61 – 0.80</span><strong>HIGH</strong></div>
          <div className="threshold-item threshold-item--critical"><span>0.81 – 1.00</span><strong>CRITICAL</strong></div>
        </div>
      </div>
    </>
  );
}

export default function TrafficAnalytics() {
  return (
    <AppLayout title="Traffic Analytics" subtitle="Density, congestion and vehicle-mix analysis from Person 3">
      <TrafficAnalyticsContent />
    </AppLayout>
  );
}
