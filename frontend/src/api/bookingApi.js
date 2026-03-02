import { API } from "./api";

export const bookingApi = {
  getTherapists: () => API.get("/v1/therapists"),
  createBooking: (data) => API.post("/v1/bookings", data),
  getMyBookings: () => API.get("/v1/bookings"),
  updateBookingStatus: (id, status) => API.patch(`/v1/bookings/${id}/status`, { status })
};
