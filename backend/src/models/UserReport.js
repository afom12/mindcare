import mongoose from "mongoose";

const userReportSchema = new mongoose.Schema(
  {
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending"
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolutionNote: { type: String, default: "" }
  },
  { timestamps: true }
);

userReportSchema.index({ reportedUserId: 1 });
userReportSchema.index({ reporterId: 1 });
userReportSchema.index({ status: 1 });
userReportSchema.index({ reporterId: 1, reportedUserId: 1 });

const UserReport = mongoose.model("UserReport", userReportSchema);

export default UserReport;
