import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["phq9", "gad7"],
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    answers: {
      type: [Number],
      required: true
    }
  },
  { timestamps: true }
);

assessmentSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
