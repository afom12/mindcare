import mongoose from "mongoose";

const REACTIONS = ["heart", "pray", "sprout", "hug"];

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    targetModel: {
      type: String,
      enum: ["Post", "Comment"],
      required: true
    },
    emoji: {
      type: String,
      enum: REACTIONS,
      required: true
    }
  },
  { timestamps: true }
);

reactionSchema.index({ targetType: 1, targetId: 1 });
reactionSchema.index({ user: 1, targetType: 1, targetId: 1, emoji: 1 }, { unique: true });

const Reaction = mongoose.model("Reaction", reactionSchema);

export default Reaction;
export { REACTIONS };
