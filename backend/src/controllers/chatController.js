import Chat from "../models/Chat.js";
import { getAIResponse } from "../services/aiService.js";
import { detectCrisis } from "../services/crisisDetection.js";

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
      let chat = await Chat.findOne({ userId });
      if (!chat) chat = new Chat({ userId, messages: [] });

      chat.messages.push({ role: "user", content: message });
      chat.messages.push({ role: "assistant", content: crisis.message });

      await chat.save();

      return res.json({
        reply: crisis.message,
        isCrisis: true,
        resources: crisis.resources,
        chat
      });
    }

    const aiReply = await getAIResponse(message);

    let chat = await Chat.findOne({ userId });
    if (!chat) chat = new Chat({ userId, messages: [] });

    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: aiReply });

    await chat.save();

    res.json({
      reply: aiReply,
      chat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
