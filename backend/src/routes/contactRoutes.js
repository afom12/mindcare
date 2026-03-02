import express from "express";
import rateLimit from "express-rate-limit";
import { submitContact, contactValidation } from "../controllers/contactController.js";

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many contact attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/contact", contactLimiter, contactValidation, submitContact);

export default router;
