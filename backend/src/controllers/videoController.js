import Booking from "../models/Booking.js";

const DAILY_API_URL = "https://api.daily.co/v1/rooms";

export const createMeeting = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const apiKey = process.env.DAILY_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message: "Video chat is not configured. Add DAILY_API_KEY to enable it."
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name")
      .populate("therapistId", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const therapistId = booking.therapistId?._id ?? booking.therapistId;
    const bookingUserId = booking.userId?._id ?? booking.userId;
    const isTherapist = req.user.role === "therapist" && therapistId.toString() === userId.toString();
    const isUser = bookingUserId.toString() === userId.toString();

    if (!isTherapist && !isUser) {
      return res.status(403).json({ message: "Not authorized for this booking" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Session must be confirmed to join" });
    }

    const now = new Date();
    const scheduled = new Date(booking.scheduledAt);
    const sessionEnd = new Date(scheduled.getTime() + (booking.durationMinutes || 50) * 60 * 1000);

    const fifteenMinBefore = new Date(scheduled.getTime() - 15 * 60 * 1000);
    const twoHoursAfter = new Date(sessionEnd.getTime() + 2 * 60 * 60 * 1000);

    if (now < fifteenMinBefore) {
      return res.status(400).json({
        message: "Session starts in 15 minutes. You can join 15 minutes before the scheduled time."
      });
    }
    if (now > twoHoursAfter) {
      return res.status(400).json({ message: "This session has ended" });
    }

    const roomName = `mindcare-${bookingId.toString().replace(/[^a-zA-Z0-9]/g, "")}`.slice(0, 128);
    const exp = Math.floor(twoHoursAfter.getTime() / 1000);

    const response = await fetch(DAILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp,
          max_participants: 2,
          enable_prejoin_ui: true
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("DAILY API ERROR:", err);
      return res.status(502).json({
        message: err.error || "Failed to create video room"
      });
    }

    const room = await response.json();

    res.json({
      url: room.url,
      meetingId: room.name,
      expiresAt: exp
    });
  } catch (error) {
    console.error("CREATE MEETING ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
