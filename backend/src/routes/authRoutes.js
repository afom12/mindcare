import express from "express";
import {
  registerUser,
  registerTherapist,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { uploadLicense } from "../config/upload.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  handleValidation,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  therapistRegisterValidation
} from "../middleware/validate.js";

const router = express.Router();

router.use(authLimiter);

router.post("/register/therapist", (req, res, next) => {
  uploadLicense(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Invalid file" });
    next();
  });
}, therapistRegisterValidation, handleValidation, registerTherapist);
router.post("/register", registerValidation, handleValidation, registerUser);
router.post("/login", loginValidation, handleValidation, loginUser);
router.post("/forgot-password", forgotPasswordValidation, handleValidation, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidation, handleValidation, resetPassword);
router.patch("/profile", protectRoute, updateProfile);

export default router;
