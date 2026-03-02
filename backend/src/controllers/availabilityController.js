import Availability from "../models/Availability.js";
import BlockedSlot from "../models/BlockedSlot.js";
import Booking from "../models/Booking.js";

function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const getAvailableSlots = async (req, res) => {
  try {
    const { id: therapistId } = req.params;
    const dateStr = req.query.date;
    if (!dateStr) {
      return res.status(400).json({ message: "date query is required (YYYY-MM-DD)" });
    }
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    targetDate.setHours(0, 0, 0, 0);
    const now = new Date();
    if (targetDate < now) {
      return res.json({ slots: [] });
    }

    const dayOfWeek = targetDate.getDay();
    const availability = await Availability.find({ therapistId, dayOfWeek }).lean();
    if (availability.length === 0) {
      return res.json({ slots: [] });
    }

    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const blocked = await BlockedSlot.find({
      therapistId,
      start: { $lte: dayEnd },
      end: { $gte: dayStart }
    }).lean();

    const existingBookings = await Booking.find({
      therapistId,
      status: { $in: ["pending", "confirmed"] },
      scheduledAt: { $gte: dayStart, $lte: dayEnd }
    }).lean();

    const slotDuration = 50;
    const slots = [];

    for (const av of availability) {
      const startMins = parseTime(av.startTime);
      const endMins = parseTime(av.endTime);
      for (let m = startMins; m + slotDuration <= endMins; m += slotDuration) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        if (slotStart < now) continue;

        const isBlocked = blocked.some(
          (b) => slotStart < new Date(b.end) && slotEnd > new Date(b.start)
        );
        if (isBlocked) continue;

        const isBooked = existingBookings.some(
          (eb) => {
            const ebStart = new Date(eb.scheduledAt);
            const ebEnd = new Date(ebStart);
            ebEnd.setMinutes(ebEnd.getMinutes() + (eb.durationMinutes || 50));
            return slotStart < ebEnd && slotEnd > ebStart;
          }
        );
        if (isBooked) continue;

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          time: formatTime(m)
        });
      }
    }

    slots.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.json({ slots });
  } catch (error) {
    console.error("GET AVAILABLE SLOTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
