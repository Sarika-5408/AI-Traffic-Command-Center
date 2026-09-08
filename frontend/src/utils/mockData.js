/**
 * utils/mockData.js
 *
 * Used ONLY as a fallback (see project requirement #17 — the dashboard must
 * not go blank if the backend is temporarily unreachable). Whenever the
 * real /api/dashboard responds successfully, that data is always preferred
 * over this.
 */
export const MOCK_DASHBOARD = {
  junction_id: "JUNCTION_1",
  junction_name: "Main City Junction",
  frame: 0,
  uptime_seconds: 0,
  vehicles: {
    count: 12,
    list: [
      { vehicle_id: "V001", type: "car", speed: 42, direction: "north", x: 300, y: 220 },
      { vehicle_id: "V002", type: "bus", speed: 28, direction: "east", x: 480, y: 300 },
      { vehicle_id: "V003", type: "bike", speed: 30, direction: "south", x: 620, y: 180 },
    ],
    by_type: { car: 7, bike: 2, bus: 1, truck: 1, auto: 1 },
  },
  risk: {
    accident_risk_score: 22,
    recent_events: [],
    near_miss_count: 0,
    ttc_seconds: 9.5,
  },
  traffic_context: {
    density: { vehicle_count: 12, road_capacity: 40, density_ratio: 0.3, density_level: "LOW" },
    congestion: { congestion_score: 25, congestion_level: "LOW", average_speed_kmh: 35 },
    weather: { condition: "CLEAR", temperature_c: 30, visibility: "GOOD", rainfall_mm: 0, wind_kmh: 8, source: "fallback" },
    road_condition: { road_condition: "GOOD", surface: "DRY", friction: "HIGH" },
    time_context: { time_of_day: "AFTERNOON", is_peak_hour: false, current_time: "--:--:--", current_date: "--" },
    signal: { signal_state: "GREEN", mode: "AUTOMATIC", auto_hold: "READY" },
    external_risk: { external_risk_score: 20, external_risk_level: "LOW", factors: {}, weights: {} },
    accident_risk_score: 22,
    average_speed_kmh: 35,
    ttc_seconds: 9.5,
  },
  overall_risk: {
    overall_risk_score: 24,
    overall_risk_level: "LOW",
    inputs: { accident_risk_score: 22, external_risk_score: 20, vehicle_volume_score: 30 },
    weights: { accident_risk: 0.55, external_risk: 0.3, vehicle_volume: 0.15 },
  },
};

export const MOCK_ALERTS = { count: 0, alerts: [] };
