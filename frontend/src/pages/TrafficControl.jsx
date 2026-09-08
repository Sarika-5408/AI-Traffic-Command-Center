import React from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import SignalControlPanel from "../components/SignalControlPanel.jsx";
import "./TrafficControl.css";

function TrafficControlContent() {
  // Data source: GET /api/traffic-signal, POST /api/traffic-signal/override
  // (SignalControlPanel calls the override endpoint directly).
  const { dashboard } = useDashboardContext();
  const signal = dashboard?.traffic_context?.signal || {};
  const overall = dashboard?.overall_risk || {};
  const command = dashboard?.traffic_context?.traffic_command || {};
  return (
    <div className="grid-row grid-row--2">
      <SignalControlPanel signal={signal} />
      <div className="panel">
  <div className="panel-header">
    <span>AI TRAFFIC CONTROL COMMAND</span>
  </div>

  <div style={{ padding: "14px" }}>
    <div className="signal-info-label">AI COMMAND</div>
    <div className="signal-info-value">
      {command.command || "MONITORING"}
    </div>

    <div className="signal-info-label" style={{ marginTop: 10 }}>
      PRIORITY
    </div>
    <div className="signal-info-value-sm">
      {command.priority || "LOW"}
    </div>

    <div className="signal-info-label" style={{ marginTop: 10 }}>
      REASON
    </div>
    <div className="signal-info-sub">
      {command.reason || "Monitoring traffic conditions"}
    </div>
  </div>
</div>

      <div className="panel">
        <div className="panel-header"><span>SIGNAL CYCLE REFERENCE</span></div>
        <div className="cycle-list">
          <div className="cycle-row"><span className="cycle-dot" style={{ background: "#22c55e" }} /> GREEN &mdash; 8 seconds</div>
          <div className="cycle-row"><span className="cycle-dot" style={{ background: "#f59e0b" }} /> YELLOW &mdash; 2 seconds</div>
          <div className="cycle-row"><span className="cycle-dot" style={{ background: "#ef4444" }} /> RED &mdash; 6 seconds</div>
        </div>
        <p className="tc-note">
          The signal cycles automatically. Use Manual Override to freeze the
          signal on its current state (e.g. for an emergency vehicle), and
          Resume Automatic to hand control back to the cycle.
        </p>
        <div className="tc-mode">
          Current mode: <strong>{signal.mode === "MANUAL_OVERRIDE" ? "Manual Override" : "Automatic"}</strong>
        </div>
      </div>
    </div>
  );
}

export default function TrafficControl() {
  return (
    <AppLayout title="Traffic Control" subtitle="Person 3 — signal simulation and manual override">
      <TrafficControlContent />
    </AppLayout>
  );
}
