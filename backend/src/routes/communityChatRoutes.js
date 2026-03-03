import express from "express";
import {
  getGroupChats,
  joinGroup,
  leaveGroup,
  getGroupMessages,
  sendGroupMessage,
  getGroupMembers,
  getPeerConversations,
  getOrCreatePeerConversation,
  getPeerMessages,
  sendPeerMessage
} from "../controllers/communityChatController.js";
import { blockUser, unblockUser, getBlockedUsers, reportUser } from "../controllers/blockController.js";
import { protectRoute, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/community-chat/groups", optionalAuth, getGroupChats);
router.post("/community-chat/groups/:groupId/join", protectRoute, joinGroup);
router.post("/community-chat/groups/:groupId/leave", protectRoute, leaveGroup);
router.get("/community-chat/groups/:groupId/messages", protectRoute, getGroupMessages);
router.post("/community-chat/groups/:groupId/messages", protectRoute, sendGroupMessage);
router.get("/community-chat/groups/:groupId/members", protectRoute, getGroupMembers);

router.get("/community-chat/peer/conversations", protectRoute, getPeerConversations);
router.get("/community-chat/peer/conversations/with/:userId", protectRoute, getOrCreatePeerConversation);
router.get("/community-chat/peer/conversations/:conversationId/messages", protectRoute, getPeerMessages);
router.post("/community-chat/peer/conversations/:conversationId/messages", protectRoute, sendPeerMessage);

router.post("/community-chat/block", protectRoute, blockUser);
router.delete("/community-chat/block/:blockedUserId", protectRoute, unblockUser);
router.get("/community-chat/blocked", protectRoute, getBlockedUsers);
router.post("/community-chat/report-user", protectRoute, reportUser);

export default router;
