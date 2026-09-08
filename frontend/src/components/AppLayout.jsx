import React from "react";
import { DashboardProvider, useDashboardContext } from "../context/DashboardContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import FooterStatusBar from "./FooterStatusBar.jsx";
import "./AppLayout.css";

/**
 * Shared shell for every page behind the Dashboard (Dashboard, Live
 * Monitor, Traffic Analytics, Risk Prediction, Risk Zones, Environment,
 * Traffic Control, Alerts, Reports, Settings). Renders the same Header +
 * Sidebar + Footer used by the Dashboard so every page visually belongs to
 * the same AI Traffic Command Center, and wires them all to one shared
 * polling connection via DashboardProvider instead of each page opening
 * its own.
 */
export default function AppLayout({ title, subtitle, children }) {
  return (
    <DashboardProvider>
      <AppShell title={title} subtitle={subtitle}>
        {children}
      </AppShell>
    </DashboardProvider>
  );
}

function AppShell({ title, subtitle, children }) {
  const { dashboard, alerts, isLive, error } = useDashboardContext();
  const overallRisk = dashboard?.overall_risk || {};

  return (
    <div className="dashboard-shell">
      <Header
        junctionName={dashboard?.junction_name}
        isLive={isLive}
        overallRisk={overallRisk}
        riskHistory={[overallRisk.overall_risk_score ?? 0]}
      />

      <div className="dashboard-body">
        <Sidebar alertCount={alerts?.count || 0} />

        <main className="dashboard-main">
          {error && (
            <div className="dashboard-banner">
              Backend unreachable — showing last known data. ({error})
            </div>
          )}

          {(title || subtitle) && (
            <div className="page-heading">
              {title && <h1 className="page-heading-title">{title}</h1>}
              {subtitle && <p className="page-heading-subtitle">{subtitle}</p>}
            </div>
          )}

          {children}
        </main>
      </div>

      <FooterStatusBar isLive={isLive} uptimeSeconds={dashboard?.uptime_seconds} />
    </div>
  );
}
