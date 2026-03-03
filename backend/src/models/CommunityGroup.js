import mongoose from "mongoose";

const communityGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    topic: {
      type: String,
      required: true,
      enum: [
        "anxiety",
        "depression",
        "trauma",
        "transitions",
        "students",
        "lgbtq",
        "wellness",
        "recovery",
        "general"
      ]
    },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "💬" },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

communityGroupSchema.index({ topic: 1 });
communityGroupSchema.index({ memberIds: 1 });

const CommunityGroup = mongoose.model("CommunityGroup", communityGroupSchema);

export default CommunityGroup;
