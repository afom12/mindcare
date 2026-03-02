import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from "../controllers/notificationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/notifications", protectRoute, getNotifications);
router.get("/notifications/unread-count", protectRoute, getUnreadCount);
router.patch("/notifications/:id/read", protectRoute, markAsRead);
router.patch("/notifications/read-all", protectRoute, markAllAsRead);

export default router;
