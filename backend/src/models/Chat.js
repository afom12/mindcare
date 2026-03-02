import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  isCrisis: { type: Boolean, default: false },
  resources: [{ name: String, number: String, text: String, url: String }],
  suggestedResources: [{ _id: mongoose.Schema.Types.ObjectId, title: String, type: String, category: String }]
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    sessionId: {
      type: String,
      default: null
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1 });
chatSchema.index({ sessionId: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
