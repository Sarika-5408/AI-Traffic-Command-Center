import { api } from "./api";

export const trafficService = {
  getTraffic: () => api.get("/traffic"),
  getWeather: () => api.get("/weather"),
  getRoadCondition: () => api.get("/road-condition"),
  getTrafficSignal: () => api.get("/traffic-signal"),
  overrideTrafficSignal: (state) => api.post("/traffic-signal/override", { state }),
  updateTrafficContext: (payload) => api.post("/traffic-context", payload),
};
