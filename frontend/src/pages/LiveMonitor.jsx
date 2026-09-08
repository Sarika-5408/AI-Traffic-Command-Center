import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import LiveTrafficFeed from "../components/LiveTrafficFeed.jsx";
import "./LiveMonitor.css";

const TYPE_COLOR = {
  car: "#22d3ee", bike: "#f59e0b", bus: "#a855f7",
  truck: "#ef4444", auto: "#22c55e", other: "#94a3b8",
};

function LiveMonitorContent() {
  // Data source: GET /api/vehicles (via the shared /api/dashboard payload,
  // which includes the same Person 1 vehicle list on every poll).
  const { dashboard, isLive } = useDashboardContext();
  const vehicles = dashboard?.vehicles || { count: 0, list: [], by_type: {} };

  return (
    <>
      <div className="grid-row grid-row--2">
        <LiveTrafficFeed vehicles={vehicles.list} isLive={isLive} />

        <div className="panel">
          <div className="panel-header"><span>VEHICLE BREAKDOWN</span></div>
          <div className="type-breakdown">
            {Object.entries(vehicles.by_type || {}).length === 0 && (
              <div className="lm-empty">No vehicles currently tracked.</div>
            )}
            {Object.entries(vehicles.by_type || {}).map(([type, count]) => (
              <div className="type-row" key={type}>
                <span className="type-dot" style={{ background: TYPE_COLOR[type] || TYPE_COLOR.other }} />
                <span className="type-label">{type.toUpperCase()}</span>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span>TRACKED VEHICLES</span>
          <span className="lm-count">{vehicles.count} total</span>
        </div>
        <div className="vehicle-table-wrap">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Speed</th><th>Direction</th><th>Position (x, y)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.list.map((v) => (
                <tr key={v.vehicle_id}>
                  <td className="vt-id" style={{ color: TYPE_COLOR[v.type] || TYPE_COLOR.other }}>{v.vehicle_id}</td>
                  <td>{v.type}</td>
                  <td>{v.speed} km/h</td>
                  <td>{v.direction}</td>
                  <td>{v.x}, {v.y}</td>
                </tr>
              ))}
              {vehicles.list.length === 0 && (
                <tr><td colSpan="5" className="lm-empty">No vehicles currently tracked.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function LiveMonitor() {
  return (
    <AppLayout title="Live Monitor" subtitle="Real-time vehicle detection feed from Person 1">
      <LiveMonitorContent />
    </AppLayout>
  );
}
