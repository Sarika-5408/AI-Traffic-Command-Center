import { api } from "./api";

export const vehicleService = {
  getVehicles: () => api.get("/vehicles"),
};
