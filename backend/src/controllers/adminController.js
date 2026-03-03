import User from "../models/User.js";
import Post from "../models/Post.js";
import Resource from "../models/Resource.js";
import Mood from "../models/Mood.js";
import Chat from "../models/Chat.js";
import CrisisEvent from "../models/CrisisEvent.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import UserReport from "../models/UserReport.js";
import CommunityGroupMessage from "../models/CommunityGroupMessage.js";
import PeerMessage from "../models/PeerMessage.js";

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (role) query.role = role;
    if (search?.trim()) {
      query.$or = [
        { name: new RegExp(search.trim(), "i") },
        { email: new RegExp(search.trim(), "i") }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(query)
    ]);
    users.forEach((u) => {
      u.status = u.status || "active";
    });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "therapist", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.user._id.toString() === id && role !== "admin") {
      return res.status(400).json({ message: "Cannot demote yourself from admin" });
    }

    const update = { role };
    if (role === "therapist") update.therapistVerification = "pending";
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      adminCount,
      activeTherapists,
      totalPosts,
      pendingPosts,
      totalResources,
      totalMoods,
      totalChats,
      totalNotifications,
      pendingReports,
      pendingUserReports,
      pendingTherapists,
      crisisAlertsToday,
      communityGroupMessages,
      peerMessages
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "therapist", therapistVerification: "verified", status: "active" }),
      Post.countDocuments({ status: "approved" }),
      Post.countDocuments({ status: "pending" }),
      Resource.countDocuments(),
      Mood.countDocuments(),
      Chat.countDocuments(),
      Notification.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      UserReport.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "therapist", therapistVerification: "pending" }),
      CrisisEvent.countDocuments({ createdAt: { $gte: todayStart } }),
      CommunityGroupMessage.countDocuments({ hidden: { $ne: true } }),
      PeerMessage.countDocuments({ hidden: { $ne: true } })
    ]);

    res.json({
      totalUsers,
      adminCount,
      activeTherapists,
      totalPosts,
      pendingPosts,
      totalResources,
      totalMoods,
      totalChats,
      totalNotifications,
      pendingReports,
      pendingUserReports,
      pendingTherapists,
      crisisAlertsToday,
      communityGroupMessages,
      peerMessages
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "Cannot change your own status" });
    }
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Community posts
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = status && ["pending", "approved", "rejected"].includes(status) ? { status } : {};
    const [posts, total] = await Promise.all([
      Post.find(query).populate("author", "name email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Post.countDocuments(query)
    ]);
    res.json({
      posts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Report.updateMany({ postId: id }, { status: "dismissed" });
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ posts });
  } catch (error) {
    console.error("GET PENDING POSTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { status: "approved" }, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (error) {
    console.error("APPROVE POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (error) {
    console.error("REJECT POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .populate("postId")
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ reports });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      id,
      { status: status || "resolved", resolvedBy: req.user._id, resolutionNote: resolutionNote || "" },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    console.error("RESOLVE REPORT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCrisisAlerts = async (req, res) => {
  try {
    const { limit = 50, source } = req.query;
    const query = source ? { source } : {};
    const alerts = await CrisisEvent.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ alerts });
  } catch (error) {
    console.error("GET CRISIS ALERTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingTherapists = async (req, res) => {
  try {
    const therapists = await User.find({ role: "therapist", therapistVerification: "pending" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ therapists });
  } catch (error) {
    console.error("GET PENDING THERAPISTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { therapistVerification: "verified" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "therapist") return res.status(400).json({ message: "User is not a therapist" });
    res.json({ user });
  } catch (error) {
    console.error("VERIFY THERAPIST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { therapistVerification: "rejected", rejectionReason: (reason || "").trim() },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("REJECT THERAPIST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAdminHealth = async (req, res) => {
  try {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      usersToday,
      usersThisWeek,
      moodsToday,
      moodsThisWeek,
      postsToday,
      postsThisWeek,
      groupMessagesToday,
      groupMessagesThisWeek,
      peerMessagesToday,
      peerMessagesThisWeek
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      Mood.countDocuments({ createdAt: { $gte: todayStart } }),
      Mood.countDocuments({ createdAt: { $gte: weekStart } }),
      Post.countDocuments({ createdAt: { $gte: todayStart }, status: "approved" }),
      Post.countDocuments({ createdAt: { $gte: weekStart }, status: "approved" }),
      CommunityGroupMessage.countDocuments({ createdAt: { $gte: todayStart }, hidden: { $ne: true } }),
      CommunityGroupMessage.countDocuments({ createdAt: { $gte: weekStart }, hidden: { $ne: true } }),
      PeerMessage.countDocuments({ createdAt: { $gte: todayStart }, hidden: { $ne: true } }),
      PeerMessage.countDocuments({ createdAt: { $gte: weekStart }, hidden: { $ne: true } })
    ]);

    const moodDistribution = await Mood.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: "$value", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      usersToday,
      usersThisWeek,
      moodsToday,
      moodsThisWeek,
      postsToday,
      postsThisWeek,
      groupMessagesToday,
      groupMessagesThisWeek,
      peerMessagesToday,
      peerMessagesThisWeek,
      moodDistribution: moodDistribution.reduce((acc, m) => ({ ...acc, [m._id]: m.count }), {})
    });
  } catch (error) {
    console.error("GET ANALYTICS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Resources CRUD
export const getResourcesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = type ? { type } : {};
    const [resources, total] = await Promise.all([
      Resource.find(query).sort({ type: 1, title: 1 }).skip(skip).limit(Number(limit)).lean(),
      Resource.countDocuments(query)
    ]);
    res.json({
      resources,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error("GET RESOURCES ADMIN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

function extractYouTubeId(str) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (trimmed.length === 11 && !trimmed.includes("/")) return trimmed;
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : trimmed;
}

export const createResource = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.type === "video" && body.videoId) {
      body.videoId = extractYouTubeId(body.videoId);
    }
    const resource = await Resource.create(body);
    res.status(201).json({ resource });
  } catch (error) {
    console.error("CREATE RESOURCE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    if (body.type === "video" && body.videoId) {
      body.videoId = extractYouTubeId(body.videoId);
    }
    const resource = await Resource.findByIdAndUpdate(id, body, { new: true });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ resource });
  } catch (error) {
    console.error("UPDATE RESOURCE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE RESOURCE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
