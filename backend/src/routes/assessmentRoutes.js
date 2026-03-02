import express from "express";
import {
  getQuestions,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentProgress
} from "../controllers/assessmentController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/questions/:type", protectRoute, getQuestions);
router.post("/:type", protectRoute, submitAssessment);
router.get("/", protectRoute, getAssessmentHistory);
router.get("/progress/:type", protectRoute, getAssessmentProgress);

export default router;
