import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { chatApi } from "../api/chatApi";

const ChatContext = createContext(null);

const normalizeMessage = (msg) => ({
  role: msg.role,
  content: msg.content,
  timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  isCrisis: msg.isCrisis,
  resources: msg.resources,
  suggestedResources: msg.suggestedResources
});

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  const loadChatHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoadingHistory(true);
    setError(null);
    try {
      if (token) {
        const { data } = await chatApi.getChatHistory();
        const msgs = (data.messages || []).map(normalizeMessage);
        setMessages(msgs);
      } else {
        const { data } = await chatApi.getAnonymousChatHistory();
        const msgs = (data.messages || []).map(normalizeMessage);
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setError("Could not load your conversation history.");
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory, user]);

  const sendMessage = useCallback(async (content, recentMood = null) => {
    if (!content?.trim() || loading) return null;

    const userMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { data } = token
        ? await chatApi.sendMessage(content.trim(), recentMood)
        : await chatApi.sendAnonymousMessage(content.trim());
      const chatMessages = (data.chat?.messages || []).map(normalizeMessage);
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg) {
        lastMsg.isCrisis = data.isCrisis;
        lastMsg.resources = data.resources;
        if (data.suggestedResources) lastMsg.suggestedResources = data.suggestedResources;
      }
      setMessages(chatMessages);
      return lastMsg;
    } catch (err) {
      console.error("Message failed:", err);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I couldn't respond right now. Please try again.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.response?.data?.error || "Failed to send message. Please try again.");
      return errorMessage;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearMessages = useCallback(() => setMessages([]), []);
  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        loadingHistory,
        error,
        sendMessage,
        clearMessages,
        loadChatHistory,
        clearError
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
