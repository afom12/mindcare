import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "therapist", "admin"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active"
    },
    therapistVerification: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: null
    },
    license: { type: String, default: "" },
    licenseType: { type: String, default: "" },
    licenseDocumentUrl: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    // Therapist profile (public)
    bio: { type: String, default: "" },
    specialties: [{ type: String }],
    approach: { type: String, default: "" },
    profilePhotoUrl: { type: String, default: "" },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
