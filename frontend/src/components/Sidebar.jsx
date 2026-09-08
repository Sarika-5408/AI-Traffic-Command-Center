import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "\u25A6", path: "/dashboard" },
  { key: "live", label: "Live Monitor", icon: "\u25A3", path: "/live-monitor" },
  { key: "analytics", label: "Traffic Analytics", icon: "\u25B2", path: "/traffic-analytics" },
  { key: "prediction", label: "Risk Prediction", icon: "\u26A0", path: "/risk-prediction" },
  { key: "zones", label: "Risk Zones", icon: "\u25C9", path: "/risk-zones" },
  { key: "environment", label: "Environment", icon: "\u2601", path: "/environment" },
  { key: "signal", label: "Traffic Control", icon: "\u25CF", path: "/traffic-control" },
  { key: "alerts", label: "Alerts", icon: "\u2317", path: "/alerts" },
  { key: "reports", label: "Reports", icon: "\u2637", path: "/reports" },
  { key: "settings", label: "Settings", icon: "\u2699", path: "/settings" },
];

/**
 * Real client-side navigation — every item routes via react-router's
 * useNavigate() (never window.location), and the active item is derived
 * from the current URL (useLocation) so browser back/forward always keeps
 * the highlighted item in sync with what's actually on screen.
 */
export default function Sidebar({ alertCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sidebar">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.key}
            type="button"
            className={`sidebar-item ${isActive ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label.toUpperCase()}</span>
            {item.key === "alerts" && alertCount > 0 && (
              <span className="sidebar-badge">{alertCount}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
