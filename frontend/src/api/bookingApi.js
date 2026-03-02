import { API } from "./api";

export const bookingApi = {
  getTherapists: () => API.get("/v1/therapists"),
  getAvailableSlots: (therapistId, date) =>
    API.get(`/v1/therapists/${therapistId}/available-slots`, { params: { date } }),
  createBooking: (data) => API.post("/v1/bookings", data),
  getMyBookings: () => API.get("/v1/bookings"),
  updateBookingStatus: (id, status) => API.patch(`/v1/bookings/${id}/status`, { status }),
  updateBookingNotes: (id, notes) => API.patch(`/v1/bookings/${id}/notes`, { notes })
};
