import express from "express";
import {
  getPosts,
  getGroups,
  createPost,
  reportPost,
  getPostComments,
  addComment,
  toggleReaction
} from "../controllers/communityController.js";
import { protectRoute, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/community/groups", getGroups);
router.get("/community", optionalAuth, getPosts);
router.get("/community/posts/:postId/comments", optionalAuth, getPostComments);
router.post("/community/posts/:postId/reactions", protectRoute, toggleReaction);
router.post("/community/posts/:postId/comments/:commentId/reactions", protectRoute, toggleReaction);
router.post("/community", protectRoute, createPost);
router.post("/community/posts/:postId/comments", protectRoute, addComment);
router.post("/community/report", protectRoute, reportPost);

export default router;
