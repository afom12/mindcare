import { API } from "./api";

export const therapistApi = {
  getDashboard: () => API.get("/v1/therapist/dashboard"),
  getAvailability: () => API.get("/v1/therapist/availability"),
  setAvailability: (slots) => API.put("/v1/therapist/availability", { slots }),
  getBlockedSlots: (params) => API.get("/v1/therapist/blocked-slots", { params }),
  addBlockedSlot: (data) => API.post("/v1/therapist/blocked-slots", data),
  deleteBlockedSlot: (id) => API.delete(`/v1/therapist/blocked-slots/${id}`),
  getClients: (params) => API.get("/v1/therapist/clients", { params }),
  getClientDetail: (clientId) => API.get(`/v1/therapist/clients/${clientId}`),
  updateProfile: (data) => API.patch("/v1/therapist/profile", data)
};
