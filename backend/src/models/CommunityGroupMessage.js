import mongoose from "mongoose";

const communityGroupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityGroup",
      required: true
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    displayName: { type: String, required: true, trim: true },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    sharedResource: {
      resourceId: mongoose.Schema.Types.ObjectId,
      title: String,
      url: String,
      type: String
    },
    hidden: { type: Boolean, default: false },
    hiddenAt: { type: Date, default: null },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    flagged: { type: Boolean, default: false },
    flaggedAt: { type: Date, default: null },
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    flagReason: { type: String, default: "" }
  },
  { timestamps: true }
);

communityGroupMessageSchema.index({ groupId: 1, createdAt: 1 });

const CommunityGroupMessage = mongoose.model("CommunityGroupMessage", communityGroupMessageSchema);

export default CommunityGroupMessage;
