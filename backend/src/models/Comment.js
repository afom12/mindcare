import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
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
      maxlength: 1000
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isTherapist: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    }
  },
  { timestamps: true }
);

commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
