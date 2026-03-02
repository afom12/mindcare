import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sun, 1=Mon, ..., 6=Sat
    startTime: { type: String, required: true }, // "09:00" HH:mm
    endTime: { type: String, required: true } // "17:00" HH:mm
  },
  { timestamps: true }
);

availabilitySchema.index({ therapistId: 1, dayOfWeek: 1 });

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
