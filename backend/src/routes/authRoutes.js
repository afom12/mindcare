import express from "express";
import { registerUser, registerTherapist, loginUser, updateProfile } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { uploadLicense } from "../config/upload.js";

const router = express.Router();

router.post("/register/therapist", (req, res, next) => {
  uploadLicense(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Invalid file" });
    next();
  });
}, registerTherapist);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/profile", protectRoute, updateProfile);

export default router;
