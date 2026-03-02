import express from "express";
import { logMood, getMoodHistory } from "../controllers/moodController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, logMood);
router.get("/", protectRoute, getMoodHistory);

export default router;
