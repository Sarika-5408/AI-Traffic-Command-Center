import React, { useEffect, useRef, useState } from "react";
import { useDashboardContext } from "../context/DashboardContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import "./Alerts.css";

const LEVEL_COLOR = {
  LOW: "var(--status-low)", MEDIUM: "var(--status-medium)",
  HIGH: "var(--status-high)", CRITICAL: "var(--status-critical)",
};

function AlertsContent() {
  const { alerts } = useDashboardContext();
  const list = alerts?.alerts || [];
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const announcedAlerts = useRef(new Set());

  useEffect(() => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    list.forEach((a) => {
       if (a.risk_score >= 80 && !announcedAlerts.current.has(a.event_id)) {
      announcedAlerts.current.add(a.event_id);

        const message = `Warning. ${a.risk_level} risk detected at ${a.location}. ${a.title}. Risk score ${a.risk_score}.`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "en-IN";
        utterance.rate = 0.9;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [list, voiceEnabled]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>ALL ALERTS</span>
        <span className="al-count">{list.length} active</span>
          <button onClick={() => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  setVoiceEnabled((v) => !v);
}}>{voiceEnabled ? "🔊 VOICE ON" : "🔇 VOICE OFF"}</button>
      </div>

      {list.length === 0 && (
        <div className="al-empty">No active alerts &mdash; junction is currently clear.</div>
      )}

      <div className="al-list">
        {list.map((a) => {
          const color = LEVEL_COLOR[a.risk_level] || LEVEL_COLOR.LOW;
          return (
            <div className="al-row" key={a.event_id} style={{ borderLeftColor: color }}>
              <div className="al-row-top">
                <span className="al-title" style={{ color }}>{a.title}</span>
                <span className="al-badge" style={{ color, borderColor: color }}>{a.risk_level}</span>
                <span className="al-time">{a.time}</span>
              </div>
              <div className="al-row-sub">
                {a.location} &middot; Vehicles: {a.vehicles.join(", ")} &middot; Risk score {a.risk_score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Alerts() {
  return (
    <AppLayout title="Alerts" subtitle="Full alert feed from Person 2's risk-event detection">
      <AlertsContent />
    </AppLayout>
  );
}





