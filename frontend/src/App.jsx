import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoadingPage from "./pages/LoadingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LiveMonitor from "./pages/LiveMonitor.jsx";
import TrafficAnalytics from "./pages/TrafficAnalytics.jsx";
import RiskPrediction from "./pages/RiskPrediction.jsx";
import RiskZones from "./pages/RiskZones.jsx";
import Environment from "./pages/Environment.jsx";
import TrafficControl from "./pages/TrafficControl.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

/**
 * App-level routing. HashRouter is used so the app runs correctly even
 * when opened as a static build with no server-side routing configured,
 * and so browser back/forward work correctly across every route below.
 *
 * Flow: Landing -> (Initialize System) -> Loading -> (auto) -> Dashboard
 * From the Dashboard, every sidebar item routes to a real page below.
 * All transitions happen via client-side navigation — no window.location
 * reloads anywhere in the app.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live-monitor" element={<LiveMonitor />} />
        <Route path="/traffic-analytics" element={<TrafficAnalytics />} />
        <Route path="/risk-prediction" element={<RiskPrediction />} />
        <Route path="/risk-zones" element={<RiskZones />} />
        <Route path="/environment" element={<Environment />} />
        <Route path="/traffic-control" element={<TrafficControl />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
