import mongoose from "mongoose";

const crisisEventSchema = new mongoose.Schema(
  {
    // Anonymous: no userId. Logged-in: has userId (for admin follow-up if needed)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, default: null },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
    // Truncated message preview for context (no full content for privacy)
    messagePreview: { type: String, maxlength: 100 },
    source: { type: String, enum: ["anonymous", "logged_in"], required: true },
    riskLevel: { type: String, enum: ["critical", "high", "moderate"], default: "critical" },
    category: { type: String, enum: ["suicidal", "self_harm", "psychosis"], default: "suicidal" }
  },
  { timestamps: true }
);

crisisEventSchema.index({ createdAt: -1 });
crisisEventSchema.index({ userId: 1 });

const CrisisEvent = mongoose.model("CrisisEvent", crisisEventSchema);

export default CrisisEvent;
