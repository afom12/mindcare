import "./config/env.js"; // Load .env FIRST before any other imports

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import messagingRoutes from "./routes/messagingRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

connectDB(); // this connects MongoDB

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", chatRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1", communityRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", resourceRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/v1", messagingRoutes);
app.use("/api/v1", videoRoutes);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth API: http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`Chat API: http://localhost:${PORT}/api/v1/ai/chat`);
});
