import { API } from "./api";

export const videoApi = {
  createMeeting: (bookingId) => API.post("/v1/video/meeting", { bookingId })
};
