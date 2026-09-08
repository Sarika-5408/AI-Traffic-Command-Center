import React from "react";
import "./FooterStatusBar.css";

function formatUptime(seconds = 0) {
  const s = Math.floor(seconds);
  const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const secs = String(s % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

export default function FooterStatusBar({ isLive, uptimeSeconds = 0 }) {
  return (
    <footer className="footer-status-bar">
      <span><span className="dot" style={{ background: "var(--cyan)" }} /> AI MODEL STATUS: {isLive ? "ACTIVE" : "STANDBY"}</span>
      <span><span className="dot" style={{ background: "var(--status-low)" }} /> DETECTOR: {isLive ? "RUNNING" : "PAUSED"}</span>
      <span><span className="dot" style={{ background: "var(--purple)" }} /> RISK ENGINE: {isLive ? "RUNNING" : "PAUSED"}</span>
      <span><span className="dot" style={{ background: isLive ? "var(--status-low)" : "var(--status-medium)" }} /> DATA SYNC: {isLive ? "LIVE" : "CACHED"}</span>
      <span>SYSTEM UPTIME: {formatUptime(uptimeSeconds)}</span>
    </footer>
  );
}
