import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

blockedUserSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });
blockedUserSchema.index({ userId: 1 });

const BlockedUser = mongoose.model("BlockedUser", blockedUserSchema);

export default BlockedUser;
