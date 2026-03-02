import { body, validationResult } from "express-validator";

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(". ");
    return res.status(400).json({ message: msg });
  }
  next();
};

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 })
    .withMessage("Password too long")
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

export const forgotPasswordValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail()
];

export const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 })
    .withMessage("Password too long")
];

export const therapistRegisterValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 })
    .withMessage("Password too long"),
  body("license").trim().notEmpty().withMessage("License number is required"),
  body("licenseType").trim().notEmpty().withMessage("License type is required")
];
