import "./config/env.js"; // Load .env FIRST before any other imports

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

connectDB(); // this connects MongoDB

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", chatRoutes);

app.get("/", (req, res) => {
  res.send("MindCare AI API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth API: http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`Chat API: http://localhost:${PORT}/api/v1/ai/chat`);
});
