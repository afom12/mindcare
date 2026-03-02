import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { messagingApi } from "../api/messagingApi";
import { MessageSquare, Loader2, Send } from "lucide-react";

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const therapistId = searchParams.get("therapist");
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const isTherapist = user?.role === "therapist";

  const loadConversations = () => {
    setLoading(true);
    messagingApi
      .getConversations()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (therapistId && !isTherapist && conversations.length >= 0) {
      const existing = conversations.find(
        (c) => c.therapistId?._id === therapistId || c.therapistId === therapistId
      );
      if (existing) {
        setSelected(existing);
        setSearchParams({});
      } else {
        messagingApi
          .getOrCreateConversation(therapistId)
          .then(({ data }) => {
            setSelected(data.conversation);
            setConversations((prev) => {
              const has = prev.some((p) => p._id === data.conversation._id);
              return has ? prev : [{ ...data.conversation, other: data.conversation.therapistId, lastMessage: null, unreadCount: 0 }, ...prev];
            });
            setSearchParams({});
          })
          .catch(() => setError("Failed to start conversation"));
      }
    }
  }, [therapistId, isTherapist, conversations]);

  const loadMessages = (convId) => {
    if (!convId) return;
    setMessagesLoading(true);
    messagingApi
      .getMessages(convId)
      .then(({ data }) => {
        setMessages(data.messages || []);
        messagingApi.markRead(convId).catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load messages"))
      .finally(() => setMessagesLoading(false));
  };

  useEffect(() => {
    if (selected) {
      loadMessages(selected._id);
      pollRef.current = setInterval(() => loadMessages(selected._id), 8000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    setError("");
    try {
      const { data } = await messagingApi.sendMessage(selected._id, input.trim());
      setMessages((prev) => [...prev, data.message]);
      setInput("");
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selected._id
            ? { ...c, lastMessage: data.message, unreadCount: 0 }
            : c
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const other = (conv) => (isTherapist ? conv.userId : conv.therapistId);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
        <div className="max-w-5xl mx-auto w-full flex flex-1 overflow-hidden">
          {/* Conversation list */}
          <div
            className={`w-full md:w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col ${
              selected ? "hidden md:flex" : ""
            }`}
          >
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-medium text-slate-800">Messages</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTherapist ? "Conversations with clients" : "Message your therapist"}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => {
                  const o = other(conv);
                  const isActive = selected?._id === conv._id;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelected(conv)}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                        isActive ? "bg-slate-100" : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-slate-600">
                          {o?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{o?.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {(conv.unreadCount > 0 || conv.lastMessage) && (
                        <div className="flex flex-col items-end gap-0.5">
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-xs rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                          {conv.lastMessage && (
                            <span className="text-xs text-slate-400">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {selected ? (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                  <button
                    onClick={() => setSelected(null)}
                    className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
                  >
                    ←
                  </button>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {other(selected)?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{other(selected)?.name}</p>
                    <p className="text-xs text-slate-500">{other(selected)?.email}</p>
                  </div>
                </div>

                {error && (
                  <div className="mx-4 mt-2 p-2 bg-rose-50 text-rose-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId?._id === user?._id || m.senderId === user?._id;
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              isMe
                                ? "bg-slate-800 text-white rounded-br-md"
                                : "bg-slate-100 text-slate-800 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? "text-slate-300" : "text-slate-400"
                              }`}
                            >
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-slate-100 flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    maxLength={5000}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {conversations.length > 0
                      ? "Select a conversation"
                      : "No conversations yet. Book a session to message your therapist."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
