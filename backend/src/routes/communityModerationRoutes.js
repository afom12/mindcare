import express from "express";
import {
  getModerationQueue,
  approvePost,
  rejectPost,
  addComment,
  pinComment,
  unpinComment,
  getPostCommentsModeration,
  getReports,
  resolveReport
} from "../controllers/communityModerationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { requireTherapistOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(requireTherapistOrAdmin);

router.get("/community/moderation", getModerationQueue);
router.put("/community/moderation/posts/:postId/approve", approvePost);
router.put("/community/moderation/posts/:postId/reject", rejectPost);
router.get("/community/moderation/posts/:postId/comments", getPostCommentsModeration);
router.post("/community/moderation/posts/:postId/comments", addComment);
router.put("/community/moderation/posts/:postId/comments/:commentId/pin", pinComment);
router.delete("/community/moderation/posts/:postId/pin", unpinComment);
router.get("/community/moderation/reports", getReports);
router.put("/community/moderation/reports/:reportId/resolve", resolveReport);

export default router;
