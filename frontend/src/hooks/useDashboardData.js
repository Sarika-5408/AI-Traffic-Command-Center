import { useEffect, useRef, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import { vehicleService } from "../services/vehicleService";
import { riskService } from "../services/riskService";
import { MOCK_DASHBOARD, MOCK_ALERTS } from "../utils/mockData";

const POLL_INTERVAL_MS = 2000;

/**
 * Polls /api/dashboard and /api/alerts on an interval. On failure (backend
 * unreachable / network error), keeps showing the last good data if any,
 * otherwise falls back to mock data — the dashboard must never render blank
 * (project requirement #17/#18). `isLive` tells the UI whether the values
 * on screen are real backend data or the fallback.
 */
export function useDashboardData() {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const hasEverSucceeded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
       const [dashboardData, vehicleData, alertsData] = await Promise.all([
        dashboardService.getDashboard(),
        vehicleService.getVehicles(),
        riskService.getAlerts(),
       ]);
        if (cancelled) return;
        setDashboard({
        ...dashboardData,
        vehicles: {
          ...vehicleData,
          list: vehicleData.vehicles || [],
         },
      });
        setAlerts(alertsData);
        setIsLive(true);
        setError(null);
        hasEverSucceeded.current = true;
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to reach backend");
        setIsLive(false);
        if (!hasEverSucceeded.current) {
          // Never had real data yet — show mock data instead of a blank screen.
          setDashboard((prev) => prev || MOCK_DASHBOARD);
          setAlerts((prev) => prev || MOCK_ALERTS);
        }
        // If we DID already have real data, keep showing the last good
        // snapshot rather than replacing it with mock data.
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { dashboard, alerts, isLive, error };
}
