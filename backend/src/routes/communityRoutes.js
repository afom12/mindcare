import express from "express";
import { getPosts, createPost, reportPost } from "../controllers/communityController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/community", getPosts);
router.post("/community", protectRoute, createPost);
router.post("/community/report", protectRoute, reportPost);

export default router;
