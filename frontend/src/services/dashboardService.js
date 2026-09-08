import { api } from "./api";

export const dashboardService = {
  getDashboard: () => api.get("/dashboard"),
  getHealth: () => api.get("/health"),
};
