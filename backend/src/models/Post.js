import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    group: {
      type: String,
      default: "general",
      trim: true
    },
    crisisFlag: {
      type: Boolean,
      default: false
    },
    crisisLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: null
    },
    crisisDetectedAt: { type: Date, default: null },
    crisisCategory: { type: String, default: null },
    pinnedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    }
  },
  { timestamps: true }
);

postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ group: 1, status: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
