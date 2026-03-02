import express from "express";
import {
  getTherapists,
  createBooking,
  getMyBookings,
  updateBookingStatus,
  updateBookingNotes
} from "../controllers/bookingController.js";
import { getAvailableSlots } from "../controllers/availabilityController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/therapists", getTherapists);
router.get("/therapists/:id/available-slots", getAvailableSlots);

router.use(protectRoute);

router.post("/bookings", createBooking);
router.get("/bookings", getMyBookings);
router.patch("/bookings/:id/status", updateBookingStatus);
router.patch("/bookings/:id/notes", updateBookingNotes);

export default router;
