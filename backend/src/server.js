import "./config/env.js"; // Load .env FIRST before any other imports

import http from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import communityModerationRoutes from "./routes/communityModerationRoutes.js";
import communityChatRoutes from "./routes/communityChatRoutes.js";
import communityChatModerationRoutes from "./routes/communityChatModerationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import messagingRoutes from "./routes/messagingRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import therapistRoutes from "./routes/therapistRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { apiLimiter } from "./middleware/rateLimit.js";

connectDB(); // this connects MongoDB

const app = express();

const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: isProd
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(null, false);
        }
      : true,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use("/api", apiLimiter);

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", chatRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1", communityRoutes);
app.use("/api/v1", communityModerationRoutes);
app.use("/api/v1", communityChatRoutes);
app.use("/api/v1", communityChatModerationRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", resourceRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/v1", messagingRoutes);
app.use("/api/v1", videoRoutes);
app.use("/api/v1/therapist", therapistRoutes);
app.use("/api/v1", contactRoutes);
app.use("/api/v1", adminRoutes);

app.get("/", (req, res) => {
  res.send("MindCare AI API running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development"
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: isProd ? allowedOrigins : "*", credentials: true }
});

io.on("connection", (socket) => {
  const { room } = socket.handshake.auth || {};
  if (room) socket.join(room);
  socket.on("join_room", ({ room: r }) => {
    if (r) socket.join(r);
  });
});

import { setCommunityChatIo } from "./controllers/communityChatController.js";
setCommunityChatIo(io);

export { io };

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth API: http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`Chat API: http://localhost:${PORT}/api/v1/ai/chat`);
});
