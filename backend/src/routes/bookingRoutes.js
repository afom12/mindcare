import express from "express";
import {
  getTherapists,
  createBooking,
  getMyBookings,
  updateBookingStatus
} from "../controllers/bookingController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/therapists", getTherapists);

router.use(protectRoute);

router.post("/bookings", createBooking);
router.get("/bookings", getMyBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

export default router;
