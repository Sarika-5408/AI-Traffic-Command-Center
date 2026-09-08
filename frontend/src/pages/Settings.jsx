import React, { useState } from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import { trafficService } from "../services/trafficService.js";
import AppLayout from "../components/AppLayout.jsx";
import "./Settings.css";

function SettingsContent() {
  const { dashboard } = useDashboardContext();
  const currentCapacity = dashboard?.traffic_context?.density?.road_capacity ?? 40;

  const [capacityInput, setCapacityInput] = useState(currentCapacity);
  const [status, setStatus] = useState(null); // null | "saving" | "saved" | "error"

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      // Real call to POST /api/traffic-context — the only settings-style
      // write endpoint this backend exposes.
      await trafficService.updateTrafficContext({ road_capacity: Number(capacityInput) });
      setStatus("saved");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <div className="panel settings-panel">
        <div className="panel-header"><span>TRAFFIC DENSITY SETTINGS</span></div>
        <form className="settings-form" onSubmit={handleSave}>
          <label className="settings-label" htmlFor="road-capacity">
            Road capacity (vehicles considered "at capacity" for density calculations)
          </label>
          <div className="settings-row">
            <input
              id="road-capacity"
              type="number"
              min="1"
              className="settings-input"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
            />
            <button type="submit" className="settings-save-btn" disabled={status === "saving"}>
              {status === "saving" ? "Saving..." : "Save"}
            </button>
          </div>
          {status === "saved" && <div className="settings-status settings-status--ok">Saved &mdash; density calculations updated.</div>}
          {status === "error" && <div className="settings-status settings-status--error">Could not reach backend. Try again.</div>}
        </form>
      </div>

      <div className="panel">
        <div className="panel-header"><span>JUNCTION INFO</span></div>
        <div className="settings-info-grid">
          <div className="settings-info-row"><span>Junction ID</span><strong>{dashboard?.junction_id || "-"}</strong></div>
          <div className="settings-info-row"><span>Junction name</span><strong>{dashboard?.junction_name || "-"}</strong></div>
          <div className="settings-info-row"><span>Dashboard refresh interval</span><strong>2 seconds</strong></div>
          <div className="settings-info-row"><span>Simulation tick interval</span><strong>~1.5 seconds</strong></div>
        </div>
      </div>
    </>
  );
}

export default function Settings() {
  return (
    <AppLayout title="Settings" subtitle="System configuration">
      <SettingsContent />
    </AppLayout>
  );
}
