import { API } from "./api";

export const moodApi = {
  logMood: (value, note) => API.post("/v1/mood", { value, note }),
  getHistory: (params) => API.get("/v1/mood", { params })
};
