import express from "express";
import {
  getDashboard,
  getAvailability,
  setAvailability,
  getBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot,
  getClients,
  getClientDetail,
  updateTherapistProfile
} from "../controllers/therapistController.js";
import {
  requestTherapistSupport,
  getTherapistConnectionStatus,
  getTherapistThreadMessages,
  postTherapistThreadMessage,
  listPendingAssignments,
  acceptAssignment
} from "../controllers/therapistStudentController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const therapistOnly = (req, res, next) => {
  if (req.user.role !== "therapist") {
    return res.status(403).json({ message: "Therapist access only" });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

const router = express.Router();

router.use(protectRoute);

/** Mobile + web: therapist assignment & human thread (same DB as /conversations) */
router.post("/request", studentOnly, requestTherapistSupport);
router.get("/status", studentOnly, getTherapistConnectionStatus);
router.get("/messages", getTherapistThreadMessages);
router.post("/messages", postTherapistThreadMessage);
router.get("/pending-assignments", therapistOnly, listPendingAssignments);
router.post("/assignments/:assignmentId/accept", therapistOnly, acceptAssignment);

router.get("/dashboard", therapistOnly, getDashboard);
router.get("/availability", therapistOnly, getAvailability);
router.put("/availability", therapistOnly, setAvailability);
router.get("/blocked-slots", therapistOnly, getBlockedSlots);
router.post("/blocked-slots", therapistOnly, addBlockedSlot);
router.delete("/blocked-slots/:id", therapistOnly, deleteBlockedSlot);
router.get("/clients", therapistOnly, getClients);
router.get("/clients/:clientId", therapistOnly, getClientDetail);
router.patch("/profile", therapistOnly, updateTherapistProfile);

export default router;
