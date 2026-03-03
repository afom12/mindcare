import mongoose from "mongoose";

const peerConversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ]
  },
  { timestamps: true }
);

peerConversationSchema.index({ participants: 1 });

peerConversationSchema.pre("save", function (next) {
  if (this.participants && this.participants.length === 2) {
    this.participants.sort((a, b) => String(a).localeCompare(String(b)));
  }
  next();
});

const PeerConversation = mongoose.model("PeerConversation", peerConversationSchema);

export default PeerConversation;
