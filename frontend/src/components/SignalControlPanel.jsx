import React, { useState } from "react";
import { trafficService } from "../services/trafficService";
import "./SignalControlPanel.css";

const LIGHT_ORDER = ["RED", "YELLOW", "GREEN"];
const LIGHT_COLOR = { RED: "#ef4444", YELLOW: "#f59e0b", GREEN: "#22c55e" };

export default function SignalControlPanel({ signal = {} }) {
  const [busy, setBusy] = useState(false);
  const state = signal.signal_state || "GREEN";
  const isManual = signal.mode === "MANUAL_OVERRIDE";

  const handleOverride = async () => {
    setBusy(true);
    try {
      if (isManual) {
        await trafficService.overrideTrafficSignal(null); // clear override, resume automatic
      } else {
        await trafficService.overrideTrafficSignal(state); // freeze on current state
      }
    } catch {
      // Non-fatal — the next poll will just show whatever the backend has.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel signal-control-panel">
      <div className="panel-header"><span>TRAFFIC SIGNAL CONTROL</span></div>

      <div className="signal-body">
        <div className="signal-lights">
          {LIGHT_ORDER.map((light) => (
            <span
              key={light}
              className="signal-light"
              style={{
                background: light === state ? LIGHT_COLOR[light] : "rgba(148,163,184,0.15)",
                boxShadow: light === state ? `0 0 12px ${LIGHT_COLOR[light]}` : "none",
              }}
            />
          ))}
        </div>

        <div className="signal-info">
          <div className="signal-info-label">CURRENT STATUS</div>
          <div className="signal-info-value" style={{ color: LIGHT_COLOR[state] }}>{state}</div>
          <div className="signal-info-sub">
            {isManual ? "Manual override active" : "Signal Operating Normally"}
          </div>

          <div className="signal-info-label" style={{ marginTop: 10 }}>AUTO HOLD SYSTEM</div>
          <div className="signal-info-value-sm">{signal.auto_hold || "READY"}</div>
        </div>
      </div>

      <button type="button" className="signal-override-btn" onClick={handleOverride} disabled={busy}>
        {isManual ? "RESUME AUTOMATIC" : "MANUAL OVERRIDE"}
      </button>
    </div>
  );
}
