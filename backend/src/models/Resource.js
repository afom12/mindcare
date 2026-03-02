import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["crisis", "article", "coping", "breathing"],
      required: true
    },
    category: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: ""
    },
    // For crisis: number, text, url, desc
    number: String,
    text: String,
    url: String,
    desc: String,
    // For breathing/coping: steps, duration, description
    steps: [String],
    duration: String,
    description: String
  },
  { timestamps: true }
);

resourceSchema.index({ type: 1, category: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
