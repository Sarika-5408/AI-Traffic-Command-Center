import { api } from "./api";

export const riskService = {
  getRisk: () => api.get("/risk"),
  getAlerts: () => api.get("/alerts"),
};
