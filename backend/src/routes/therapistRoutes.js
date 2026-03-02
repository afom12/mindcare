import express from "express";
import {
  getDashboard,
  getAvailability,
  setAvailability,
  getBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot,
  getClients,
  getClientDetail
} from "../controllers/therapistController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const therapistOnly = (req, res, next) => {
  if (req.user.role !== "therapist") {
    return res.status(403).json({ message: "Therapist access only" });
  }
  next();
};

const router = express.Router();

router.use(protectRoute);

router.get("/dashboard", therapistOnly, getDashboard);
router.get("/availability", therapistOnly, getAvailability);
router.put("/availability", therapistOnly, setAvailability);
router.get("/blocked-slots", therapistOnly, getBlockedSlots);
router.post("/blocked-slots", therapistOnly, addBlockedSlot);
router.delete("/blocked-slots/:id", therapistOnly, deleteBlockedSlot);
router.get("/clients", therapistOnly, getClients);
router.get("/clients/:clientId", therapistOnly, getClientDetail);

export default router;
