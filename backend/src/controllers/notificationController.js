import Notification from "../models/Notification.js";
import Mood from "../models/Mood.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await createMoodReminderIfNeeded(userId);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ notifications });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ count });
  } catch (error) {
    console.error("UNREAD COUNT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createMoodReminderIfNeeded = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastMood = await Mood.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  if (lastMood) {
    const lastDate = new Date(lastMood.createdAt);
    lastDate.setHours(0, 0, 0, 0);
    if (lastDate.getTime() === today.getTime()) return;
  }

  const existing = await Notification.findOne({
    userId,
    type: "mood_reminder",
    createdAt: { $gte: today }
  });
  if (existing) return;

  await Notification.create({
    userId,
    type: "mood_reminder",
    title: "How are you feeling today?",
    body: "A quick check-in can help you track your wellness.",
    link: "/mood"
  });
};
