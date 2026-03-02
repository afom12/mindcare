import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    if (user.status === "suspended" || user.status === "banned") {
      return res.status(403).json({ message: "Your account has been restricted." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please login again." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    res.status(500).json({ message: "Authentication failed." });
  }
};

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
