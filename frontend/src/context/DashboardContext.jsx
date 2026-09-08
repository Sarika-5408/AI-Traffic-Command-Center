import React, { createContext, useContext } from "react";
import { useDashboardData } from "../hooks/useDashboardData.js";

/**
 * Single shared source of live backend data for every page under
 * AppLayout. Without this, each page would open its own polling loop
 * against /api/dashboard + /api/alerts — this way there is exactly one
 * poller per mounted page, and every page (Dashboard, Live Monitor,
 * Traffic Analytics, etc.) reads the same consistent snapshot.
 */
const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const value = useDashboardData();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used inside <DashboardProvider>/<AppLayout>");
  }
  return ctx;
}
