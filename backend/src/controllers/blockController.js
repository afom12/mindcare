import BlockedUser from "../models/BlockedUser.js";
import UserReport from "../models/UserReport.js";

export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { blockedUserId } = req.body;

    if (!blockedUserId) return res.status(400).json({ error: "blockedUserId is required" });
    if (blockedUserId === userId.toString()) return res.status(400).json({ error: "Cannot block yourself" });

    const existing = await BlockedUser.findOne({ userId, blockedUserId });
    if (existing) return res.json({ blocked: true });

    await BlockedUser.create({ userId, blockedUserId });
    res.json({ blocked: true });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { blockedUserId } = req.params;

    await BlockedUser.findOneAndDelete({ userId, blockedUserId });
    res.json({ unblocked: true });
  } catch (error) {
    console.error("UNBLOCK USER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const blocked = await BlockedUser.find({ userId })
      .populate("blockedUserId", "name")
      .lean();

    const result = blocked
      .filter((b) => b.blockedUserId)
      .map((b) => ({
        _id: b.blockedUserId._id,
        name: b.blockedUserId.name || "Unknown"
      }));

    res.json({ blocked: result });
  } catch (error) {
    console.error("GET BLOCKED USERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const reportUser = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { reportedUserId, reason } = req.body;

    if (!reportedUserId || !reason?.trim()) {
      return res.status(400).json({ error: "reportedUserId and reason are required" });
    }
    if (reportedUserId === reporterId.toString()) {
      return res.status(400).json({ error: "Cannot report yourself" });
    }

    const existing = await UserReport.findOne({ reporterId, reportedUserId });
    if (existing) return res.status(400).json({ error: "You have already reported this user" });

    await UserReport.create({ reportedUserId, reporterId, reason: reason.trim() });
    res.status(201).json({ reported: true });
  } catch (error) {
    console.error("REPORT USER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
