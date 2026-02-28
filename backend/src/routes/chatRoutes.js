import express from "express";
import { sendMessage } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protectRoute, sendMessage);

export default router;
