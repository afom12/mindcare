import crypto from "crypto";

/**
 * Middleware for anonymous chat.
 * Requires X-Anonymous-Session header. If missing, generates one and attaches to response.
 */
export const requireAnonymousSession = (req, res, next) => {
  const sessionId = req.headers["x-anonymous-session"];
  if (sessionId && typeof sessionId === "string" && sessionId.length >= 16) {
    req.anonymousSessionId = sessionId;
    return next();
  }
  req.anonymousSessionId = crypto.randomUUID();
  res.setHeader("X-Anonymous-Session", req.anonymousSessionId);
  next();
};
