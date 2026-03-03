import Mood from "../models/Mood.js";
import Notification from "../models/Notification.js";

const MOOD_LABELS = {
  1: "Struggling",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great"
};

export const logMood = async (req, res) => {
  try {
    const userId = req.user._id;
    const { value, note } = req.body;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Mood value must be between 1 and 5" });
    }

    const mood = await Mood.create({
      userId,
      value: Number(value),
      note: note || ""
    });

    if (Number(value) <= 2) {
      const quotes = [
        "You don't have to be great to start, but you have to start to be great.",
        "This feeling will pass. You've survived 100% of your bad days.",
        "Be gentle with yourself. You're doing the best you can.",
        "Small steps still move you forward.",
        "It's okay to not be okay. Asking for help is strength."
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      await Notification.create({
        userId,
        type: "general",
        title: "A gentle reminder",
        body: `${quote} — Check out breathing exercises and coping strategies in Resources.`,
        link: "/resources"
      });
    }

    return res.status(201).json({
      message: "Mood logged",
      mood: {
        id: mood._id,
        value: mood.value,
        label: MOOD_LABELS[mood.value],
        note: mood.note,
        createdAt: mood.createdAt
      }
    });
  } catch (error) {
    console.error("LOG MOOD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 30, days = 7 } = req.query;

    const moods = await Mood.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const moodsWithLabels = moods.map((m) => ({
      ...m,
      label: MOOD_LABELS[m.value]
    }));

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(days));
    const recentMoods = moods.filter((m) => new Date(m.createdAt) >= cutoff);

    const avgThisWeek =
      recentMoods.length > 0
        ? (recentMoods.reduce((s, m) => s + m.value, 0) / recentMoods.length).toFixed(1)
        : null;

    res.json({
      moods: moodsWithLabels,
      stats: {
        total: moods.length,
        thisWeek: recentMoods.length,
        averageThisWeek: avgThisWeek ? parseFloat(avgThisWeek) : null
      }
    });
  } catch (error) {
    console.error("GET MOOD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
