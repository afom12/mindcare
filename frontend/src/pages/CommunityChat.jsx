import { useState, useEffect, useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { communityChatApi } from "../api/communityChatApi";
import { resourceApi } from "../api/resourceApi";
import { io } from "socket.io-client";
import { Users, MessageCircle, Loader2, Send, LogIn, LogOut, UserPlus, BookOpen, ExternalLink, Ban, Flag, MoreVertical, ChevronLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "") || window.location.origin;

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function CommunityChat() {
  const { user } = useAuth();
  const [mode, setMode] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [peerConversations, setPeerConversations] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [peerMessages, setPeerMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showPeerMenu, setShowPeerMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const loadGroups = async () => {
    try {
      const { data } = await communityChatApi.getGroups();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const loadPeerConversations = async () => {
    try {
      const { data } = await communityChatApi.getPeerConversations();
      setPeerConversations(data.conversations || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load conversations");
    }
  };

  const loadBlockedUsers = async () => {
    if (!user) return;
    try {
      const { data } = await communityChatApi.getBlockedUsers();
      setBlockedUsers(data.blocked || []);
    } catch {
      setBlockedUsers([]);
    }
  };

  useEffect(() => {
    if (user) {
      loadGroups();
      loadPeerConversations();
      loadBlockedUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const joinGroup = async (group) => {
    if (!user) return;
    try {
      await communityChatApi.joinGroup(group._id);
      loadGroups();
      setSelectedGroup(group);
      loadGroupMessages(group._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join");
    }
  };

  const leaveGroup = async () => {
    if (!selectedGroup) return;
    try {
      await communityChatApi.leaveGroup(selectedGroup._id);
      loadGroups();
      setSelectedGroup(null);
      setGroupMessages([]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave");
    }
  };

  const loadGroupMessages = async (groupId) => {
    if (!groupId) return;
    setMessagesLoading(true);
    try {
      const { data } = await communityChatApi.getGroupMessages(groupId);
      setGroupMessages(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadGroupMembers = async () => {
    if (!selectedGroup) return;
    try {
      const { data } = await communityChatApi.getGroupMembers(selectedGroup._id);
      setMembers(data.members || []);
      setShowMembers(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load members");
    }
  };

  const loadPeerMessages = async (conversationId) => {
    if (!conversationId) return;
    setMessagesLoading(true);
    try {
      const { data } = await communityChatApi.getPeerMessages(conversationId);
      setPeerMessages(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const startPeerChat = async (otherUserId) => {
    try {
      const { data } = await communityChatApi.getOrCreatePeerConversation(otherUserId);
      setSelectedPeer(data.conversation);
      loadPeerMessages(data.conversation._id);
      loadPeerConversations();
      setShowMembers(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start chat");
    }
  };

  useEffect(() => {
    if (selectedGroup?.isMember) {
      loadGroupMessages(selectedGroup._id);
    }
  }, [selectedGroup?._id, selectedGroup?.isMember]);

  useEffect(() => {
    if (selectedPeer) {
      loadPeerMessages(selectedPeer._id);
    }
  }, [selectedPeer?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, peerMessages]);

  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedGroup?.isMember) return;

    socket.emit("join_room", { room: `group-${selectedGroup._id}` });
    const handler = (msg) => setGroupMessages((prev) => [...prev, msg]);
    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [selectedGroup?._id, selectedGroup?.isMember]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedPeer) return;

    socket.emit("join_room", { room: `peer-${selectedPeer._id}` });
    const handler = (msg) => setPeerMessages((prev) => [...prev, msg]);
    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [selectedPeer?._id]);

  const loadResources = async () => {
    setResourcesLoading(true);
    try {
      const { data } = await resourceApi.getResources({});
      setResources(data.resources || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleSendGroupMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedGroup || sending || !user) return;
    setSending(true);
    setError("");
    try {
      const payload = { content: input.trim(), isAnonymous };
      if (selectedResource) payload.resourceId = selectedResource._id;
      const { data } = await communityChatApi.sendGroupMessage(selectedGroup._id, payload);
      setGroupMessages((prev) => [...prev, data.message]);
      setInput("");
      setSelectedResource(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleSendPeerMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPeer || sending || !user) return;
    setSending(true);
    setError("");
    try {
      const payload = { content: input.trim(), isAnonymous };
      if (selectedResource) payload.resourceId = selectedResource._id;
      const { data } = await communityChatApi.sendPeerMessage(selectedPeer._id, payload);
      setPeerMessages((prev) => [...prev, data.message]);
      setInput("");
      setSelectedResource(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedPeer(null);
    if (group.isMember) {
      setSelectedGroup(group);
      loadGroupMessages(group._id);
    } else {
      joinGroup(group);
    }
  };

  const handleSelectPeer = (conv) => {
    setSelectedGroup(null);
    setSelectedPeer(conv);
    setShowPeerMenu(false);
    loadPeerMessages(conv._id);
  };

  const isPeerBlocked = selectedPeer?.otherUser?._id && blockedUsers.some((b) => b._id === selectedPeer.otherUser._id);

  const handleBlockUser = async () => {
    if (!selectedPeer?.otherUser?._id) return;
    try {
      await communityChatApi.blockUser(selectedPeer.otherUser._id);
      setBlockedUsers((prev) => [...prev, { _id: selectedPeer.otherUser._id, name: selectedPeer.otherUser.name }]);
      setSelectedPeer(null);
      setPeerMessages([]);
      loadPeerConversations();
      setShowPeerMenu(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to block");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedPeer?.otherUser?._id) return;
    try {
      await communityChatApi.unblockUser(selectedPeer.otherUser._id);
      setBlockedUsers((prev) => prev.filter((b) => b._id !== selectedPeer.otherUser._id));
      setShowPeerMenu(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to unblock");
    }
  };

  const handleReportUser = async () => {
    if (!selectedPeer?.otherUser?._id || !reportReason.trim()) return;
    setReporting(true);
    setError("");
    try {
      await communityChatApi.reportUser(selectedPeer.otherUser._id, reportReason.trim());
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to report");
    } finally {
      setReporting(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-medium text-slate-800 mb-2">Sign in to chat</h2>
            <p className="text-slate-500 text-sm mb-6">
              Join topic-based groups or message peers for support. All chats are moderated for safety.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
            >
              <LogIn size={18} />
              Sign in
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 h-[calc(100vh-4rem)]">
        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setMode("groups")}
            className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium ${
              mode === "groups" ? "text-slate-800 border-b-2 border-slate-800" : "text-slate-500"
            }`}
          >
            <Users size={18} />
            Group Chats
          </button>
          <button
            onClick={() => setMode("peer")}
            className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium ${
              mode === "peer" ? "text-slate-800 border-b-2 border-slate-800" : "text-slate-500"
            }`}
          >
            <MessageCircle size={18} />
            Direct Messages
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between gap-4">
            <p className="text-rose-700 text-sm flex-1 truncate">{error}</p>
            <button
              onClick={() => { setError(""); loadGroups(); loadPeerConversations(); }}
              className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar - hidden on mobile when chat is selected */}
          <div
            className={`w-full md:w-72 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0 transition-all ${
              (selectedGroup || selectedPeer) ? "hidden md:block" : "block"
            }`}
          >
            {mode === "groups" ? (
              loading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : (
                <div className="p-2">
                  {groups.map((g) => (
                    <button
                      key={g._id}
                      onClick={() => handleSelectGroup(g)}
                      className={`w-full text-left p-3 rounded-xl mb-1 transition ${
                        selectedGroup?._id === g._id ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{g.name}</p>
                          <p className="text-xs text-slate-500">{g.memberCount} members</p>
                        </div>
                        {g.isMember && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            Joined
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="p-2">
                {peerConversations.length === 0 ? (
                  <p className="p-4 text-slate-500 text-sm">
                    No conversations yet. Join a group and message a member to start.
                  </p>
                ) : (
                  peerConversations.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => handleSelectPeer(c)}
                      className={`w-full text-left p-3 rounded-xl mb-1 transition ${
                        selectedPeer?._id === c._id ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-medium text-slate-800 truncate">
                        {c.otherUser?.name || "Anonymous"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 ${(selectedGroup || selectedPeer) ? "flex" : "hidden md:flex"}`}>
            {mode === "groups" && selectedGroup ? (
              <>
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => { setSelectedGroup(null); setGroupMessages([]); }}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0"
                      aria-label="Back to groups"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-xl flex-shrink-0">{selectedGroup.icon}</span>
                    <div>
                      <h2 className="font-medium text-slate-800">{selectedGroup.name}</h2>
                      <p className="text-xs text-slate-500">{selectedGroup.memberCount} members</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadGroupMembers}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                      title="Members"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      onClick={leaveGroup}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <LogOut size={14} />
                      Leave
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    groupMessages.map((m) => (
                      <div key={m._id} className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-0.5">{m.displayName}</span>
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
                          <p className="text-slate-700 text-sm">{m.content}</p>
                          {m.sharedResource && (
                            <a
                              href={m.sharedResource.url || "/resources"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl hover:bg-slate-100"
                            >
                              <BookOpen size={14} className="text-slate-500" />
                              <span className="text-sm font-medium text-slate-700">{m.sharedResource.title}</span>
                              <ExternalLink size={12} className="text-slate-400" />
                            </a>
                          )}
                          <span className="text-xs text-slate-400 block mt-1">{formatTime(m.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendGroupMessage} className="p-4 bg-white border-t border-slate-200">
                  {error && <p className="text-rose-600 text-sm mb-2">{error}</p>}
                  {selectedResource && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                      <BookOpen size={14} />
                      <span className="text-sm flex-1 truncate">{selectedResource.title}</span>
                      <button type="button" onClick={() => setSelectedResource(null)} className="text-slate-500 hover:text-slate-700">
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowResourcePicker(true); loadResources(); }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Share resource"
                    >
                      <BookOpen size={18} />
                    </button>
                    <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      Anonymous
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </form>
              </>
            ) : mode === "peer" && selectedPeer ? (
              <>
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => { setSelectedPeer(null); setPeerMessages([]); }}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="min-w-0">
                    <h2 className="font-medium text-slate-800 truncate">
                      {selectedPeer.otherUser?.name || "Anonymous"}
                    </h2>
                  <p className="text-xs text-slate-500">Direct message • Moderated</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowPeerMenu(!showPeerMenu)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                      title="More options"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {showPeerMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowPeerMenu(false)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-xl shadow-lg border border-slate-200 z-20 min-w-[140px]">
                          {isPeerBlocked ? (
                            <button
                              onClick={handleUnblockUser}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Ban size={14} />
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={handleBlockUser}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Ban size={14} />
                              Block
                            </button>
                          )}
                          <button
                            onClick={() => { setShowReportModal(true); setShowPeerMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Flag size={14} />
                            Report user
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    peerMessages.map((m) => (
                      <div
                        key={m._id}
                        className={`flex ${m.isFromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                            m.isFromMe
                              ? "bg-slate-800 text-white rounded-tr-sm"
                              : "bg-white rounded-tl-sm"
                          }`}
                        >
                          {!m.isFromMe && (
                            <span className="text-xs opacity-80 block mb-0.5">{m.displayName}</span>
                          )}
                          <p className="text-sm">{m.content}</p>
                          {m.sharedResource && (
                            <a
                              href={m.sharedResource.url || "/resources"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 flex items-center gap-2 p-2 rounded-xl ${m.isFromMe ? "bg-slate-700" : "bg-slate-50 hover:bg-slate-100"}`}
                            >
                              <BookOpen size={14} />
                              <span className="text-sm font-medium truncate">{m.sharedResource.title}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <span
                            className={`text-xs block mt-1 ${m.isFromMe ? "text-slate-300" : "text-slate-400"}`}
                          >
                            {formatTime(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendPeerMessage} className="p-4 bg-white border-t border-slate-200">
                  {error && <p className="text-rose-600 text-sm mb-2">{error}</p>}
                  {selectedResource && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                      <BookOpen size={14} />
                      <span className="text-sm flex-1 truncate">{selectedResource.title}</span>
                      <button type="button" onClick={() => setSelectedResource(null)} className="text-slate-500 hover:text-slate-700">
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowResourcePicker(true); loadResources(); }}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Share resource"
                    >
                      <BookOpen size={18} />
                    </button>
                    <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      Anonymous
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">
                    {mode === "groups"
                      ? "Select a group to join and chat"
                      : "Select a conversation or start one from a group"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Members panel - slide-over on mobile */}
          {showMembers && (
            <>
              <div
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={() => setShowMembers(false)}
                aria-hidden="true"
              />
              <div className="fixed inset-y-0 right-0 w-64 max-w-[85vw] bg-white border-l border-slate-200 overflow-y-auto z-50 md:relative md:inset-auto md:max-w-none">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                  <h3 className="font-medium text-slate-800">Members</h3>
                  <button
                    onClick={() => setShowMembers(false)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    ×
                  </button>
                </div>
              <div className="p-2">
                {members.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => startPeerChat(m._id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {m.displayName?.[0] || "?"}
                      </span>
                    </div>
                    <span className="text-sm text-slate-700">{m.displayName}</span>
                    <MessageCircle size={14} className="text-slate-400 ml-auto" />
                  </button>
                ))}
              </div>
              </div>
            </>
          )}

          {/* Report user modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-medium text-slate-800">Report user</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Report {selectedPeer?.otherUser?.name || "this user"} for review. Please describe the issue.
                  </p>
                </div>
                <div className="p-4">
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue (required)..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 resize-none"
                  />
                  {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
                </div>
                <div className="p-4 border-t border-slate-200 flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowReportModal(false); setReportReason(""); setError(""); }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportUser}
                    disabled={reporting || !reportReason.trim()}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag size={14} />}
                    Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resource picker modal */}
          {showResourcePicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">Share a resource</h3>
                  <button
                    onClick={() => setShowResourcePicker(false)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[50vh]">
                  {resourcesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                  ) : resources.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No resources available</p>
                  ) : (
                    <div className="space-y-2">
                      {resources.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => {
                            setSelectedResource(r);
                            setShowResourcePicker(false);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3"
                        >
                          <BookOpen size={18} className="text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{r.title}</p>
                            <p className="text-xs text-slate-500">{r.type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
