import mongoose from "mongoose";

const peerMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerConversation",
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
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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

peerMessageSchema.index({ conversationId: 1, createdAt: 1 });

const PeerMessage = mongoose.model("PeerMessage", peerMessageSchema);

export default PeerMessage;
