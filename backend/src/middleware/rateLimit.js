import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

// Auth routes: stricter limits to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 10 : 50,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// General API: moderate limits
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 500,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false
});
