import Booking from "../models/Booking.js";
import Mood from "../models/Mood.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import BlockedSlot from "../models/BlockedSlot.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const getDashboard = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);

    const allBookings = await Booking.find({ therapistId })
      .populate("userId", "name email")
      .sort({ scheduledAt: -1 })
      .lean();

    const todayAppointments = allBookings.filter(
      (b) =>
        b.status === "confirmed" &&
        new Date(b.scheduledAt) >= todayStart &&
        new Date(b.scheduledAt) <= todayEnd
    ).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const thisWeekCount = allBookings.filter(
      (b) =>
        (b.status === "confirmed" || b.status === "completed") &&
        new Date(b.scheduledAt) >= weekStart
    ).length;

    const pendingNotes = allBookings.filter(
      (b) => b.status === "completed" && (!b.notes || !b.notes.trim())
    ).slice(0, 10);

    const clientIds = [...new Set(allBookings.map((b) => (b.userId?._id || b.userId)?.toString()).filter(Boolean))];
    const recentClients = await Promise.all(
      clientIds.slice(0, 10).map(async (uid) => {
        const userBookings = allBookings
          .filter((b) => (b.userId?._id || b.userId)?.toString() === uid)
          .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        const lastBooking = userBookings.find((b) => b.status === "completed" || b.status === "confirmed") || userBookings[0];
        const lastSession = lastBooking
          ? new Date(lastBooking.scheduledAt)
          : null;
        const lastMood = await Mood.findOne({ userId: uid })
          .sort({ createdAt: -1 })
          .lean();
        const moodLabels = ["", "Very low", "Low", "Okay", "Good", "Great"];
        return {
          id: uid,
          name: lastBooking?.userId?.name || "Client",
          lastSession: lastSession ? formatRelative(lastSession) : "—",
          mood: lastMood ? moodLabels[lastMood.value] || "—" : "—",
          progress: "—"
        };
      })
    );

    res.json({
      todayAppointments,
      todayCount: todayAppointments.length,
      thisWeekCount,
      pendingNotes,
      pendingNotesCount: pendingNotes.length,
      recentClients
    });
  } catch (error) {
    console.error("THERAPIST DASHBOARD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

function formatRelative(d) {
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  return d.toLocaleDateString();
}

export const getAvailability = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const slots = await Availability.find({ therapistId }).sort({ dayOfWeek: 1, startTime: 1 }).lean();
    res.json({ availability: slots });
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const setAvailability = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { slots } = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: "slots must be an array" });
    }
    await Availability.deleteMany({ therapistId });
    const valid = slots.filter(
      (s) =>
        typeof s.dayOfWeek === "number" &&
        s.dayOfWeek >= 0 &&
        s.dayOfWeek <= 6 &&
        typeof s.startTime === "string" &&
        typeof s.endTime === "string"
    );
    if (valid.length > 0) {
      await Availability.insertMany(
        valid.map((s) => ({
          therapistId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      );
    }
    const updated = await Availability.find({ therapistId }).sort({ dayOfWeek: 1, startTime: 1 }).lean();
    res.json({ availability: updated });
  } catch (error) {
    console.error("SET AVAILABILITY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlockedSlots = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { from, to } = req.query;
    const query = { therapistId };
    if (from) query.end = { $gte: new Date(from) };
    if (to) query.start = query.start ? { ...query.start, $lte: new Date(to) } : { $lte: new Date(to) };
    const slots = await BlockedSlot.find(query).sort({ start: 1 }).lean();
    res.json({ blockedSlots: slots });
  } catch (error) {
    console.error("GET BLOCKED SLOTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addBlockedSlot = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { start, end, reason } = req.body;
    if (!start || !end) {
      return res.status(400).json({ message: "start and end are required" });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      return res.status(400).json({ message: "Invalid start/end dates" });
    }
    const slot = await BlockedSlot.create({
      therapistId,
      start: startDate,
      end: endDate,
      reason: reason || ""
    });
    res.status(201).json({ blockedSlot: slot });
  } catch (error) {
    console.error("ADD BLOCKED SLOT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlockedSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistId = req.user._id;
    const slot = await BlockedSlot.findOneAndDelete({ _id: id, therapistId });
    if (!slot) return res.status(404).json({ message: "Blocked slot not found" });
    res.json({ message: "Blocked slot removed" });
  } catch (error) {
    console.error("DELETE BLOCKED SLOT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getClients = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { search } = req.query;
    const bookings = await Booking.find({ therapistId })
      .populate("userId", "name email")
      .sort({ scheduledAt: -1 })
      .lean();

    const clientMap = new Map();
    for (const b of bookings) {
      const uid = (b.userId?._id || b.userId)?.toString();
      if (!uid) continue;
      if (!clientMap.has(uid)) {
        clientMap.set(uid, {
          id: uid,
          name: b.userId?.name || "Client",
          email: b.userId?.email || "",
          sessions: [],
          lastSession: null
        });
      }
      const c = clientMap.get(uid);
      c.sessions.push(b);
      if (!c.lastSession || new Date(b.scheduledAt) > new Date(c.lastSession)) {
        c.lastSession = b.scheduledAt;
      }
    }

    let clients = Array.from(clientMap.values()).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      sessionCount: c.sessions.length,
      lastSession: c.lastSession
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    res.json({ clients });
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getClientDetail = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { clientId } = req.params;
    const bookings = await Booking.find({
      therapistId,
      userId: clientId
    })
      .sort({ scheduledAt: -1 })
      .lean();

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    const user = await User.findById(clientId).select("name email").lean();
    const moods = await Mood.find({ userId: clientId }).sort({ createdAt: -1 }).limit(30).lean();

    res.json({
      client: { id: clientId, name: user?.name || "Client", email: user?.email || "" },
      sessions: bookings,
      recentMoods: moods.map((m) => ({ value: m.value, date: m.createdAt }))
    });
  } catch (error) {
    console.error("GET CLIENT DETAIL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
