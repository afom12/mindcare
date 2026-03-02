import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const getTherapists = async (req, res) => {
  try {
    const therapists = await User.find({
      role: "therapist",
      therapistVerification: "verified",
      status: "active"
    })
      .select("name email license")
      .sort({ name: 1 })
      .lean();
    res.json({ therapists });
  } catch (error) {
    console.error("GET THERAPISTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can book therapy sessions" });
    }
    const userId = req.user._id;
    const { therapistId, scheduledAt, durationMinutes = 50, notes } = req.body;

    if (!therapistId || !scheduledAt) {
      return res.status(400).json({ message: "therapistId and scheduledAt are required" });
    }

    const therapist = await User.findOne({
      _id: therapistId,
      role: "therapist",
      therapistVerification: "verified",
      status: "active"
    });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime()) || scheduled <= new Date()) {
      return res.status(400).json({ message: "scheduledAt must be a valid future date" });
    }

    const booking = await Booking.create({
      userId,
      therapistId,
      scheduledAt: scheduled,
      durationMinutes: durationMinutes || 50,
      notes: notes || ""
    });

    await booking.populate("therapistId", "name email");
    await booking.populate("userId", "name email");

    // Notify therapist
    await Notification.create({
      userId: therapistId,
      type: "general",
      title: "New booking request",
      body: `${req.user.name} requested a session for ${scheduled.toLocaleString()}`,
      link: "/bookings"
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    let query;
    if (role === "therapist") {
      query = { therapistId: userId };
    } else {
      query = { userId };
    }

    const bookings = await Booking.find(query)
      .populate(role === "therapist" ? "userId" : "therapistId", "name email")
      .sort({ scheduledAt: -1 })
      .limit(50)
      .lean();

    res.json({ bookings });
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isTherapist = req.user.role === "therapist" && booking.therapistId.toString() === userId.toString();
    const isUser = booking.userId.toString() === userId.toString();

    if (!isTherapist && !isUser) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    const canUpdate = isTherapist
      ? ["confirmed", "cancelled", "completed"].includes(status)
      : status === "cancelled";

    if (!canUpdate) {
      return res.status(403).json({ message: "Not authorized for this action" });
    }

    booking.status = status;
    await booking.save();
    await booking.populate("therapistId", "name email");
    await booking.populate("userId", "name email");

    const targetUserId = booking.userId?._id ?? booking.userId;
    const targetTherapistId = booking.therapistId?._id ?? booking.therapistId;

    if (status === "confirmed" && isTherapist) {
      await Notification.create({
        userId: targetUserId,
        type: "general",
        title: "Session confirmed",
        body: `${req.user.name} confirmed your session for ${new Date(booking.scheduledAt).toLocaleString()}`,
        link: "/bookings"
      });
    } else if (status === "cancelled" && isTherapist) {
      await Notification.create({
        userId: targetUserId,
        type: "general",
        title: "Session declined",
        body: `${req.user.name} declined your session request for ${new Date(booking.scheduledAt).toLocaleString()}`,
        link: "/bookings"
      });
    } else if (status === "cancelled" && isUser) {
      await Notification.create({
        userId: targetTherapistId,
        type: "general",
        title: "Booking cancelled",
        body: `${req.user.name} cancelled their session for ${new Date(booking.scheduledAt).toLocaleString()}`,
        link: "/bookings"
      });
    }

    res.json({ booking });
  } catch (error) {
    console.error("UPDATE BOOKING ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isTherapist = req.user.role === "therapist" && booking.therapistId.toString() === userId.toString();
    if (!isTherapist) {
      return res.status(403).json({ message: "Only the therapist can add session notes" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Notes can only be added for completed sessions" });
    }

    booking.notes = typeof notes === "string" ? notes : "";
    await booking.save();
    await booking.populate("therapistId", "name email");
    await booking.populate("userId", "name email");

    res.json({ booking });
  } catch (error) {
    console.error("UPDATE BOOKING NOTES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
