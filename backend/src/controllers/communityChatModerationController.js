import CommunityGroup from "../models/CommunityGroup.js";
import CommunityGroupMessage from "../models/CommunityGroupMessage.js";
import PeerConversation from "../models/PeerConversation.js";
import PeerMessage from "../models/PeerMessage.js";
import UserReport from "../models/UserReport.js";

const TOPIC_CONFIG = {
  anxiety: { name: "Anxiety & Stress", icon: "🌿" },
  depression: { name: "Depression & Mood", icon: "💭" },
  trauma: { name: "Trauma & PTSD", icon: "🧠" },
  transitions: { name: "Life Transitions", icon: "🌈" },
  students: { name: "Students & Academics", icon: "🎓" },
  lgbtq: { name: "LGBTQ+ Support", icon: "🏳️‍🌈" },
  wellness: { name: "Wellness & Self-Care", icon: "🧘" },
  recovery: { name: "Recovery & Sobriety", icon: "🤝" },
  general: { name: "General Support", icon: "💬" }
};

export const getModerationGroups = async (req, res) => {
  try {
    const groups = await CommunityGroup.find()
      .sort({ topic: 1 })
      .lean();

    const messageCounts = await CommunityGroupMessage.aggregate([
      { $match: { hidden: { $ne: true } } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(messageCounts.map((m) => [m._id.toString(), m.count]));

    const flaggedCounts = await CommunityGroupMessage.aggregate([
      { $match: { flagged: true } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } }
    ]);
    const flaggedMap = Object.fromEntries(flaggedCounts.map((m) => [m._id.toString(), m.count]));

    const result = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      topic: g.topic,
      icon: g.icon,
      memberCount: g.memberIds?.length || 0,
      messageCount: countMap[g._id.toString()] || 0,
      flaggedCount: flaggedMap[g._id.toString()] || 0
    }));

    res.json({ groups: result });
  } catch (error) {
    console.error("GET MODERATION GROUPS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getModerationGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 100 } = req.query;

    const group = await CommunityGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const messages = await CommunityGroupMessage.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("senderId", "name")
      .lean();

    const result = messages.map((m) => ({
      _id: m._id,
      displayName: m.isAnonymous ? "Anonymous" : m.displayName,
      content: m.content,
      sharedResource: m.sharedResource || null,
      createdAt: m.createdAt,
      hidden: m.hidden || false,
      flagged: m.flagged || false,
      flagReason: m.flagReason
    }));

    res.json({
      group: { _id: group._id, name: group.name, icon: group.icon },
      messages: result.reverse()
    });
  } catch (error) {
    console.error("GET MODERATION GROUP MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getModerationPeerConversations = async (req, res) => {
  try {
    const convos = await PeerConversation.find()
      .populate("participants", "name")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    const messageCounts = await PeerMessage.aggregate([
      { $match: { hidden: { $ne: true } } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(messageCounts.map((m) => [m._id.toString(), m.count]));

    const result = convos.map((c) => {
      const participants = (c.participants || []).map((p) => ({
        _id: p._id,
        name: p.name
      }));
      return {
        _id: c._id,
        participants,
        messageCount: countMap[c._id.toString()] || 0,
        updatedAt: c.updatedAt
      };
    });

    res.json({ conversations: result });
  } catch (error) {
    console.error("GET MODERATION PEER CONVERSATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getModerationPeerMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 100 } = req.query;

    const convo = await PeerConversation.findById(conversationId).populate("participants", "name");
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const messages = await PeerMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("senderId", "name")
      .lean();

    const result = messages.map((m) => ({
      _id: m._id,
      displayName: m.isAnonymous ? "Anonymous" : m.displayName,
      content: m.content,
      sharedResource: m.sharedResource || null,
      createdAt: m.createdAt,
      hidden: m.hidden || false,
      flagged: m.flagged || false,
      flagReason: m.flagReason
    }));

    res.json({
      conversation: {
        _id: convo._id,
        participants: (convo.participants || []).map((p) => ({ _id: p._id, name: p.name }))
      },
      messages: result.reverse()
    });
  } catch (error) {
    console.error("GET MODERATION PEER MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const flagGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const msg = await CommunityGroupMessage.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.flagged = true;
    msg.flaggedAt = new Date();
    msg.flaggedBy = userId;
    msg.flagReason = reason || "";
    await msg.save();

    res.json({ message: { _id: msg._id, flagged: true } });
  } catch (error) {
    console.error("FLAG GROUP MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const hideGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await CommunityGroupMessage.findByIdAndUpdate(
      messageId,
      { hidden: true, hiddenAt: new Date(), hiddenBy: userId },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });

    res.json({ message: { _id: msg._id, hidden: true } });
  } catch (error) {
    console.error("HIDE GROUP MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const flagPeerMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const msg = await PeerMessage.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.flagged = true;
    msg.flaggedAt = new Date();
    msg.flaggedBy = userId;
    msg.flagReason = reason || "";
    await msg.save();

    res.json({ message: { _id: msg._id, flagged: true } });
  } catch (error) {
    console.error("FLAG PEER MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const hidePeerMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await PeerMessage.findByIdAndUpdate(
      messageId,
      { hidden: true, hiddenAt: new Date(), hiddenBy: userId },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });

    res.json({ message: { _id: msg._id, hidden: true } });
  } catch (error) {
    console.error("HIDE PEER MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const reports = await UserReport.find(query)
      .populate("reportedUserId", "name email")
      .populate("reporterId", "name")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const result = reports.map((r) => ({
      _id: r._id,
      reportedUser: r.reportedUserId ? { _id: r.reportedUserId._id, name: r.reportedUserId.name } : null,
      reporter: r.reporterId ? { _id: r.reporterId._id, name: r.reporterId.name } : null,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt
    }));

    res.json({ reports: result });
  } catch (error) {
    console.error("GET USER REPORTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resolveUserReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNote } = req.body;
    const userId = req.user._id;

    const validStatus = ["resolved", "dismissed"];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({ error: "status must be 'resolved' or 'dismissed'" });
    }

    const report = await UserReport.findByIdAndUpdate(
      reportId,
      { status, resolvedBy: userId, resolutionNote: resolutionNote || "" },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json({ report: { _id: report._id, status: report.status } });
  } catch (error) {
    console.error("RESOLVE USER REPORT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
