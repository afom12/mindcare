import CommunityGroup from "../models/CommunityGroup.js";
import CommunityGroupMessage from "../models/CommunityGroupMessage.js";
import PeerConversation from "../models/PeerConversation.js";
import PeerMessage from "../models/PeerMessage.js";
import Resource from "../models/Resource.js";
import Notification from "../models/Notification.js";
import BlockedUser from "../models/BlockedUser.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { detectCrisis } from "../services/crisisDetection.js";

async function isBlockedBetween(userIdA, userIdB) {
  const a = userIdA?.toString?.() || String(userIdA);
  const b = userIdB?.toString?.() || String(userIdB);
  if (a === b || !mongoose.isValidObjectId(a) || !mongoose.isValidObjectId(b)) return false;
  const blocked = await BlockedUser.findOne({
    $or: [
      { userId: new mongoose.Types.ObjectId(a), blockedUserId: new mongoose.Types.ObjectId(b) },
      { userId: new mongoose.Types.ObjectId(b), blockedUserId: new mongoose.Types.ObjectId(a) }
    ]
  });
  return !!blocked;
}

let ioRef = null;
export function setCommunityChatIo(io) {
  ioRef = io;
}

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

async function ensureGroupsExist() {
  const existing = await CommunityGroup.countDocuments();
  if (existing > 0) return;

  const groups = Object.entries(TOPIC_CONFIG).map(([topic, config]) => ({
    name: config.name,
    topic,
    description: `Peer support for ${config.name.toLowerCase()}`,
    icon: config.icon,
    memberIds: []
  }));
  await CommunityGroup.insertMany(groups);
}

export const getGroupChats = async (req, res) => {
  try {
    await ensureGroupsExist();
    const groups = await CommunityGroup.find()
      .sort({ topic: 1 })
      .lean();

    const userId = req.user?._id?.toString();
    const result = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      topic: g.topic,
      icon: g.icon,
      memberCount: g.memberIds?.length || 0,
      isMember: userId && g.memberIds?.some((id) => id.toString() === userId)
    }));

    res.json({ groups: result });
  } catch (error) {
    console.error("GET GROUP CHATS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await CommunityGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.memberIds) group.memberIds = [];
    if (group.memberIds.some((id) => id.toString() === userId.toString())) {
      return res.json({ group: { _id: group._id, joined: true } });
    }

    group.memberIds.push(userId);
    await group.save();

    res.json({ group: { _id: group._id, joined: true } });
  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    await CommunityGroup.findByIdAndUpdate(groupId, {
      $pull: { memberIds: userId }
    });

    res.json({ left: true });
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const { before, limit = 50 } = req.query;

    const group = await CommunityGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.memberIds?.some((id) => id.toString() === userId.toString());
    if (!isMember) return res.status(403).json({ error: "Join the group to view messages" });

    const query = { groupId, hidden: { $ne: true } };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await CommunityGroupMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const sanitized = messages.reverse().map((m) => ({
      _id: m._id,
      displayName: m.isAnonymous ? "Anonymous" : m.displayName,
      content: m.content,
      sharedResource: m.sharedResource || null,
      createdAt: m.createdAt
    }));

    res.json({ messages: sanitized });
  } catch (error) {
    console.error("GET GROUP MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, isAnonymous, resourceId } = req.body;
    const user = req.user;

    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const group = await CommunityGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.memberIds?.some((id) => id.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: "Join the group to send messages" });

    const crisis = detectCrisis(content.trim());
    if (crisis) {
      return res.status(400).json({
        error: "Your message contains concerning content. Please reach out to 988 or text HOME to 741741 for support."
      });
    }

    const displayName = isAnonymous ? "Anonymous" : user.name?.split(" ")[0] || "Someone";

    let sharedResource = null;
    if (resourceId && mongoose.isValidObjectId(resourceId)) {
      const resource = await Resource.findById(resourceId).lean();
      if (resource) {
        const url = resource.url || resource.source || (resource.videoId ? `https://youtube.com/watch?v=${resource.videoId}` : null);
        sharedResource = {
          resourceId: resource._id,
          title: resource.title,
          url,
          type: resource.type
        };
      }
    }

    const msgData = {
      groupId,
      senderId: user._id,
      displayName,
      isAnonymous: !!isAnonymous,
      content: content.trim()
    };
    if (sharedResource) msgData.sharedResource = sharedResource;

    const msg = await CommunityGroupMessage.create(msgData);

    const sanitized = {
      _id: msg._id,
      displayName: msg.isAnonymous ? "Anonymous" : msg.displayName,
      content: msg.content,
      sharedResource: msg.sharedResource || null,
      createdAt: msg.createdAt
    };

    if (ioRef) ioRef.to(`group-${groupId}`).emit("new_message", sanitized);

    const otherMemberIds = (group.memberIds || []).filter((id) => id.toString() !== user._id.toString());
    for (const memberId of otherMemberIds) {
      await Notification.create({
        userId: memberId,
        type: "chat_message",
        title: `New message in ${group.name || "group"}`,
        body: (msg.isAnonymous ? "Anonymous" : msg.displayName) + ": " + (msg.content?.slice(0, 50) || ""),
        link: "/community/chat"
      });
    }

    res.status(201).json({ message: sanitized });
  } catch (error) {
    console.error("SEND GROUP MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await CommunityGroup.findById(groupId).populate("memberIds", "name");
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.memberIds?.some((id) => id.toString() === userId.toString());
    if (!isMember) return res.status(403).json({ error: "Join the group to see members" });

    const others = (group.memberIds || []).filter((m) => m._id.toString() !== userId.toString());
    const members = [];
    for (const m of others) {
      if (await isBlockedBetween(userId, m._id)) continue;
      members.push({
        _id: m._id,
        displayName: m.name?.split(" ")[0] || "Someone"
      });
    }

    res.json({ members });
  } catch (error) {
    console.error("GET GROUP MEMBERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPeerConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const convos = await PeerConversation.find({ participants: userId })
      .populate("participants", "name")
      .sort({ updatedAt: -1 })
      .lean();

    const result = [];
    for (const c of convos) {
      const other = c.participants.find((p) => p._id.toString() !== userId.toString());
      if (!other || (await isBlockedBetween(userId, other._id))) continue;
      result.push({
        _id: c._id,
        otherUser: { _id: other._id, name: other.name },
        updatedAt: c.updatedAt
      });
    }

    res.json({ conversations: result });
  } catch (error) {
    console.error("GET PEER CONVERSATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrCreatePeerConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const myId = req.user._id;

    if (otherUserId === myId.toString()) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    if (await isBlockedBetween(myId, otherUserId)) {
      return res.status(403).json({ error: "You cannot message this user" });
    }

    const other = await User.findById(otherUserId);
    if (!other) return res.status(404).json({ error: "User not found" });

    const otherId = mongoose.isValidObjectId(otherUserId) ? new mongoose.Types.ObjectId(otherUserId) : null;
    if (!otherId) return res.status(400).json({ error: "Invalid user" });

    const sorted = [myId, otherId].sort((a, b) => String(a).localeCompare(String(b)));
    let convo = await PeerConversation.findOne({
      participants: { $all: sorted }
    }).populate("participants", "name");

    if (!convo) {
      convo = await PeerConversation.create({ participants: sorted });
      convo = await PeerConversation.findById(convo._id).populate("participants", "name");
    }

    const otherUser = convo.participants.find((p) => p._id.toString() !== myId.toString());

    res.json({
      conversation: {
        _id: convo._id,
        otherUser: otherUser ? { _id: otherUser._id, name: otherUser.name } : { _id: other._id, name: other.name }
      }
    });
  } catch (error) {
    console.error("GET OR CREATE PEER CONVERSATION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPeerMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { before, limit = 50 } = req.query;

    const convo = await PeerConversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const isParticipant = convo.participants.some((id) => id.toString() === userId.toString());
    if (!isParticipant) return res.status(403).json({ error: "Not in this conversation" });

    const query = { conversationId, hidden: { $ne: true } };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await PeerMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const sanitized = messages.reverse().map((m) => ({
      _id: m._id,
      senderId: m.senderId.toString(),
      isFromMe: m.senderId.toString() === userId.toString(),
      displayName: m.isAnonymous ? "Anonymous" : m.displayName,
      content: m.content,
      sharedResource: m.sharedResource || null,
      createdAt: m.createdAt
    }));

    res.json({ messages: sanitized });
  } catch (error) {
    console.error("GET PEER MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const sendPeerMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, isAnonymous, resourceId } = req.body;
    const user = req.user;

    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const convo = await PeerConversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const isParticipant = convo.participants.some((id) => id.toString() === user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: "Not in this conversation" });

    const otherParticipant = convo.participants.find((id) => id.toString() !== user._id.toString());
    if (otherParticipant && (await isBlockedBetween(user._id, otherParticipant))) {
      return res.status(403).json({ error: "You cannot message this user" });
    }

    const crisis = detectCrisis(content.trim());
    if (crisis) {
      return res.status(400).json({
        error: "Your message contains concerning content. Please reach out to 988 or text HOME to 741741 for support."
      });
    }

    const displayName = isAnonymous ? "Anonymous" : user.name?.split(" ")[0] || "Someone";

    let sharedResource = null;
    if (resourceId && mongoose.isValidObjectId(resourceId)) {
      const resource = await Resource.findById(resourceId).lean();
      if (resource) {
        const url = resource.url || resource.source || (resource.videoId ? `https://youtube.com/watch?v=${resource.videoId}` : null);
        sharedResource = {
          resourceId: resource._id,
          title: resource.title,
          url,
          type: resource.type
        };
      }
    }

    const msgData = {
      conversationId,
      senderId: user._id,
      displayName,
      isAnonymous: !!isAnonymous,
      content: content.trim()
    };
    if (sharedResource) msgData.sharedResource = sharedResource;

    const msg = await PeerMessage.create(msgData);

    await PeerConversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    if (otherParticipant) {
      await Notification.create({
        userId: otherParticipant,
        type: "chat_message",
        title: "New direct message",
        body: (msg.isAnonymous ? "Anonymous" : msg.displayName) + ": " + (msg.content?.slice(0, 50) || ""),
        link: "/community/chat"
      });
    }

    const sanitizedMsg = {
      _id: msg._id,
      isFromMe: true,
      displayName: msg.isAnonymous ? "Anonymous" : msg.displayName,
      content: msg.content,
      sharedResource: msg.sharedResource || null,
      createdAt: msg.createdAt
    };
    if (ioRef) ioRef.to(`peer-${conversationId}`).emit("new_message", sanitizedMsg);

    res.status(201).json({
      message: {
        _id: msg._id,
        isFromMe: true,
        displayName: msg.isAnonymous ? "Anonymous" : msg.displayName,
        content: msg.content,
        sharedResource: msg.sharedResource || null,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    console.error("SEND PEER MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
