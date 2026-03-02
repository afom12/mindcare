import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const isParticipant = (conv, userId) => {
  const uid = userId.toString();
  return conv.userId.toString() === uid || conv.therapistId.toString() === uid;
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    const query = role === "therapist" ? { therapistId: userId } : { userId: userId };
    const conversations = await Conversation.find(query)
      .populate(role === "therapist" ? "userId" : "therapistId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    const convsWithLast = await Promise.all(
      conversations.map(async (c) => {
        const last = await Message.findOne({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .select("content createdAt senderId")
          .lean();
        const unread = await Message.countDocuments({
          conversationId: c._id,
          senderId: { $ne: userId },
          readAt: null
        });
        const other = role === "therapist" ? c.userId : c.therapistId;
        return {
          ...c,
          other,
          lastMessage: last,
          unreadCount: unread
        };
      })
    );

    res.json({ conversations: convsWithLast });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { therapistId } = req.params;

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can start conversations with therapists" });
    }

    const therapist = await User.findOne({
      _id: therapistId,
      role: "therapist",
      therapistVerification: "verified",
      status: "active"
    });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    let conv = await Conversation.findOne({
      userId,
      therapistId
    }).populate("therapistId", "name email");

    if (!conv) {
      conv = await Conversation.create({ userId, therapistId });
      await conv.populate("therapistId", "name email");
    }

    res.json({ conversation: conv });
  } catch (error) {
    console.error("GET OR CREATE CONVERSATION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrCreateConversationWithClient = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { clientId } = req.params;

    if (req.user.role !== "therapist") {
      return res.status(403).json({ message: "Only therapists can start conversations with clients" });
    }

    const client = await User.findOne({ _id: clientId, role: "user" });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    let conv = await Conversation.findOne({
      userId: clientId,
      therapistId
    }).populate("userId", "name email");

    if (!conv) {
      conv = await Conversation.create({ userId: clientId, therapistId });
      await conv.populate("userId", "name email");
    }

    res.json({ conversation: conv });
  } catch (error) {
    console.error("GET OR CREATE CONVERSATION WITH CLIENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { before, limit = 50 } = req.query;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conv, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const query = { conversationId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .populate("senderId", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conv, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content.trim()
    });

    await message.populate("senderId", "name");
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    res.status(201).json({ message });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conv, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, readAt: null },
      { readAt: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
