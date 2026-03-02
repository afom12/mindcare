import express from "express";
import {
  getConversations,
  getOrCreateConversation,
  getOrCreateConversationWithClient,
  getMessages,
  sendMessage,
  markMessagesRead
} from "../controllers/messagingController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/conversations", getConversations);
router.get("/conversations/with/:therapistId", getOrCreateConversation);
router.get("/conversations/with-client/:clientId", getOrCreateConversationWithClient);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markMessagesRead);

export default router;
