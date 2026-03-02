import { body, validationResult } from "express-validator";
import { sendContactEmail } from "../services/emailService.js";

export const contactValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ max: 200 })
    .withMessage("Subject too long"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 5000 })
    .withMessage("Message too long")
];

export const submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map((e) => e.msg).join(". ");
      return res.status(400).json({ message: msg });
    }

    const { email, subject, message } = req.body;
    await sendContactEmail({ email, subject, message });

    res.status(200).json({ message: "Thank you for reaching out. We'll get back to you soon." });
  } catch (error) {
    console.error("CONTACT SUBMIT ERROR:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};
