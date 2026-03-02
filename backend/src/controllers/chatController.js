import Chat from "../models/Chat.js";
import CrisisEvent from "../models/CrisisEvent.js";
import Resource from "../models/Resource.js";
import { getAIResponse } from "../services/aiService.js";
import { detectCrisis } from "../services/crisisDetection.js";

const recordCrisisEvent = async (opts) => {
  try {
    await CrisisEvent.create({
      userId: opts.userId ?? null,
      sessionId: opts.sessionId ?? null,
      chatId: opts.chatId ?? null,
      messagePreview: (opts.message || "").slice(0, 100),
      source: opts.source
    });
  } catch (err) {
    console.error("CRISIS EVENT RECORD ERROR:", err);
  }
};

const getSuggestedResources = async (limit = 3) => {
  const resources = await Resource.find({ type: { $in: ["breathing", "coping"] } })
    .limit(limit)
    .select("title type category")
    .lean();
  return resources.filter(Boolean);
};

const findOrCreateChat = async (userId, sessionId) => {
  const query = userId ? { userId } : { sessionId };
  let chat = await Chat.findOne(query);
  if (!chat) {
    chat = new Chat(userId ? { userId, messages: [] } : { sessionId, messages: [] });
  }
  return chat;
};

export const getAnonymousChatHistory = async (req, res) => {
  try {
    const sessionId = req.anonymousSessionId;
    const chat = await Chat.findOne({ sessionId });

    res.json({
      messages: chat?.messages || [],
      chatId: chat?._id,
      sessionId
    });
  } catch (error) {
    console.error("GET ANONYMOUS CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const sendAnonymousMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.anonymousSessionId;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const crisis = detectCrisis(message);
    if (crisis) {
      let chat = await findOrCreateChat(null, sessionId);
      chat.messages.push({ role: "user", content: message });
      chat.messages.push({
        role: "assistant",
        content: crisis.message,
        isCrisis: true,
        resources: crisis.resources
      });
      await chat.save();

      await recordCrisisEvent({ sessionId, chatId: chat._id, message, source: "anonymous" });

      return res.json({
        reply: crisis.message,
        isCrisis: true,
        resources: crisis.resources,
        chat,
        sessionId
      });
    }

    let chat = await findOrCreateChat(null, sessionId);
    const recentMessages = (chat.messages || [])
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    const aiReply = await getAIResponse(message, recentMessages);

    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: aiReply });
    await chat.save();

    res.json({
      reply: aiReply,
      chat,
      sessionId
    });
  } catch (error) {
    console.error("ANONYMOUS CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findOne({ userId });

    return res.json({
      messages: chat?.messages || [],
      chatId: chat?._id
    });
  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

const findOrCreateChatForUser = async (userId) => {
  let chat = await Chat.findOne({ userId });
  if (!chat) chat = new Chat({ userId, messages: [] });
  return chat;
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    // Crisis detection - respond immediately with resources
    const crisis = detectCrisis(message);
    if (crisis) {
      let chat = await findOrCreateChatForUser(userId);

      chat.messages.push({ role: "user", content: message });
      chat.messages.push({
        role: "assistant",
        content: crisis.message,
        isCrisis: true,
        resources: crisis.resources
      });

      await chat.save();

      await recordCrisisEvent({ userId, chatId: chat._id, message, source: "logged_in" });

      return res.json({
        reply: crisis.message,
        isCrisis: true,
        resources: crisis.resources,
        chat
      });
    }

    let chat = await findOrCreateChatForUser(userId);

    const recentMessages = (chat.messages || [])
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    const moodContext = req.body.recentMood ? { value: req.body.recentMood.value, label: req.body.recentMood.label } : null;
    const aiReply = await getAIResponse(message, recentMessages, moodContext);

    let suggestedResources = [];
    if (moodContext?.value <= 2) {
      suggestedResources = await getSuggestedResources(3);
    }

    const assistantMsg = {
      role: "assistant",
      content: aiReply,
      ...(suggestedResources.length > 0 && { suggestedResources })
    };
    chat.messages.push({ role: "user", content: message });
    chat.messages.push(assistantMsg);

    await chat.save();

    res.json({
      reply: aiReply,
      chat,
      suggestedResources: suggestedResources.length > 0 ? suggestedResources : undefined
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const migrateAnonymousChat = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const anonChat = await Chat.findOne({ sessionId });
    if (!anonChat || !anonChat.messages?.length) {
      return res.json({ migrated: false, message: "No anonymous chat to migrate" });
    }

    let userChat = await Chat.findOne({ userId });
    if (!userChat) {
      userChat = new Chat({ userId, messages: [] });
    }

    userChat.messages.push(...anonChat.messages);
    userChat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    await userChat.save();

    await Chat.deleteOne({ sessionId });

    res.json({
      migrated: true,
      messageCount: anonChat.messages.length,
      messages: userChat.messages
    });
  } catch (error) {
    console.error("MIGRATE CHAT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
