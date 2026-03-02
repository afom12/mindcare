import mongoose from "mongoose";

const blockedSlotSchema = new mongoose.Schema(
  {
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

blockedSlotSchema.index({ therapistId: 1, start: 1 });

const BlockedSlot = mongoose.model("BlockedSlot", blockedSlotSchema);

export default BlockedSlot;
