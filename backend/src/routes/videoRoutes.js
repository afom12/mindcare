import express from "express";
import { createMeeting } from "../controllers/videoController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.post("/video/meeting", createMeeting);

export default router;
