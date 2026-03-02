import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, therapistId: 1 }, { unique: true });
conversationSchema.index({ therapistId: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
