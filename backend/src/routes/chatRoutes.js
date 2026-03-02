import express from "express";
import {
  sendMessage,
  getChatHistory,
  sendAnonymousMessage,
  getAnonymousChatHistory,
  migrateAnonymousChat
} from "../controllers/chatController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { requireAnonymousSession } from "../middleware/optionalAuth.js";

const router = express.Router();

router.get("/chat", protectRoute, getChatHistory);
router.post("/chat", protectRoute, sendMessage);

router.get("/chat/anonymous", requireAnonymousSession, getAnonymousChatHistory);
router.post("/chat/anonymous", requireAnonymousSession, sendAnonymousMessage);
router.post("/chat/migrate", protectRoute, migrateAnonymousChat);

export default router;
