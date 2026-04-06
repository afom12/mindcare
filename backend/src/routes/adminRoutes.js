import express from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  getStats,
  getPosts,
  getPendingPosts,
  approvePost,
  rejectPost,
  deletePost,
  getReports,
  resolveReport,
  getCrisisAlerts,
  getPendingTherapists,
  verifyTherapist,
  rejectTherapist,
  getResourcesAdmin,
  createResource,
  updateResource,
  deleteResource,
  getAdminHealth,
  getAnalytics
} from "../controllers/adminController.js";
import { adminListAssignments, adminAssignStudent } from "../controllers/therapistStudentController.js";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute, requireAdmin);

router.get("/admin/users", getUsers);
router.get("/admin/users/:id", getUserById);
router.get("/admin/stats", getStats);
router.patch("/admin/users/:id/role", updateUserRole);
router.put("/admin/users/:id/status", updateUserStatus);

router.get("/admin/posts", getPosts);
router.get("/admin/pending-posts", getPendingPosts);
router.post("/admin/posts/:id/approve", approvePost);
router.post("/admin/posts/:id/reject", rejectPost);
router.delete("/admin/posts/:id", deletePost);

router.get("/admin/reports", getReports);
router.post("/admin/reports/:id/resolve", resolveReport);

router.get("/admin/crisis-alerts", getCrisisAlerts);

router.get("/admin/pending-therapists", getPendingTherapists);
router.post("/admin/therapists/:id/verify", verifyTherapist);
router.post("/admin/therapists/:id/reject", rejectTherapist);

router.get("/admin/therapist-assignments", adminListAssignments);
router.post("/admin/therapist-assignments/:assignmentId/assign", adminAssignStudent);

router.get("/admin/resources", getResourcesAdmin);
router.post("/admin/resources", createResource);
router.patch("/admin/resources/:id", updateResource);
router.delete("/admin/resources/:id", deleteResource);

router.get("/admin/health", getAdminHealth);
router.get("/admin/analytics", getAnalytics);

export default router;
