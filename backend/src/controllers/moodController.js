import Mood from "../models/Mood.js";

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
