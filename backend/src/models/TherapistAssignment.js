import mongoose from "mongoose";

const therapistAssignmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "closed"],
      default: "pending"
    },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
    closedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

therapistAssignmentSchema.index({ studentId: 1, status: 1 });
therapistAssignmentSchema.index({ therapistId: 1, status: 1 });

const TherapistAssignment = mongoose.model("TherapistAssignment", therapistAssignmentSchema);

export default TherapistAssignment;
