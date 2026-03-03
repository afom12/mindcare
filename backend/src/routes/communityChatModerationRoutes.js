import express from "express";
import {
  getModerationGroups,
  getModerationGroupMessages,
  getModerationPeerConversations,
  getModerationPeerMessages,
  flagGroupMessage,
  hideGroupMessage,
  flagPeerMessage,
  hidePeerMessage,
  getUserReports,
  resolveUserReport
} from "../controllers/communityChatModerationController.js";
import { protectRoute, requireTherapistOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(requireTherapistOrAdmin);

router.get("/community-chat/moderation/groups", getModerationGroups);
router.get("/community-chat/moderation/groups/:groupId/messages", getModerationGroupMessages);
router.put("/community-chat/moderation/group-messages/:messageId/flag", flagGroupMessage);
router.put("/community-chat/moderation/group-messages/:messageId/hide", hideGroupMessage);

router.get("/community-chat/moderation/peer/conversations", getModerationPeerConversations);
router.get("/community-chat/moderation/peer/conversations/:conversationId/messages", getModerationPeerMessages);
router.put("/community-chat/moderation/peer-messages/:messageId/flag", flagPeerMessage);
router.put("/community-chat/moderation/peer-messages/:messageId/hide", hidePeerMessage);

router.get("/community-chat/moderation/user-reports", getUserReports);
router.put("/community-chat/moderation/user-reports/:reportId/resolve", resolveUserReport);

export default router;
