import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Shield,
  MessageCircle,
  Users,
  Flag,
  EyeOff,
  Loader2,
  UserX,
  Check,
  X
} from "lucide-react";
import { communityChatModerationApi } from "../api/communityChatModerationApi";

function formatDate(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function CommunityChatModeration() {
  const [mode, setMode] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [peerMessages, setPeerMessages] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data } = await communityChatModerationApi.getGroups();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data } = await communityChatModerationApi.getPeerConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReports = async () => {
    setLoading(true);
    try {
      const { data } = await communityChatModerationApi.getUserReports({});
      setUserReports(data.reports || []);
    } catch (err) {
      console.error("Failed to load user reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "groups") loadGroups();
    else if (mode === "peer") loadConversations();
    else if (mode === "reports") loadUserReports();
  }, [mode]);

  const loadGroupMessages = async (groupId) => {
    setMessagesLoading(true);
    setSelectedGroup(null);
    setSelectedConversation(null);
    try {
      const { data } = await communityChatModerationApi.getGroupMessages(groupId);
      setGroupMessages(data.messages || []);
      setSelectedGroup(data.group);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadPeerMessages = async (conversationId) => {
    setMessagesLoading(true);
    setSelectedGroup(null);
    setSelectedConversation(null);
    try {
      const { data } = await communityChatModerationApi.getPeerMessages(conversationId);
      setPeerMessages(data.messages || []);
      setSelectedConversation(data.conversation);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleFlagGroupMessage = async (messageId) => {
    const reason = window.prompt("Reason for flagging (optional):");
    if (reason === null) return;
    setActionLoading(messageId);
    try {
      await communityChatModerationApi.flagGroupMessage(messageId, reason || "");
      if (selectedGroup) loadGroupMessages(selectedGroup._id);
    } catch (err) {
      console.error("Flag failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHideGroupMessage = async (messageId) => {
    if (!window.confirm("Hide this message from the group? It will no longer be visible to members.")) return;
    setActionLoading(messageId);
    try {
      await communityChatModerationApi.hideGroupMessage(messageId);
      if (selectedGroup) loadGroupMessages(selectedGroup._id);
    } catch (err) {
      console.error("Hide failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagPeerMessage = async (messageId) => {
    const reason = window.prompt("Reason for flagging (optional):");
    if (reason === null) return;
    setActionLoading(messageId);
    try {
      await communityChatModerationApi.flagPeerMessage(messageId, reason || "");
      if (selectedConversation) loadPeerMessages(selectedConversation._id);
    } catch (err) {
      console.error("Flag failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHidePeerMessage = async (messageId) => {
    if (!window.confirm("Hide this message? It will no longer be visible to participants.")) return;
    setActionLoading(messageId);
    try {
      await communityChatModerationApi.hidePeerMessage(messageId);
      if (selectedConversation) loadPeerMessages(selectedConversation._id);
    } catch (err) {
      console.error("Hide failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveUserReport = async (reportId, status) => {
    setActionLoading(reportId);
    try {
      await communityChatModerationApi.resolveUserReport(reportId, { status });
      loadUserReports();
    } catch (err) {
      console.error("Resolve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-slate-800">
                Chat <span className="font-medium text-slate-700">Moderation</span>
              </h1>
              <p className="text-slate-500 mt-1">Monitor group chats and peer conversations</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setMode("groups")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                mode === "groups" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users size={16} />
              Group Chats
            </button>
            <button
              onClick={() => setMode("peer")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                mode === "peer" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageCircle size={16} />
              Peer Conversations
            </button>
            <button
              onClick={() => setMode("reports")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                mode === "reports" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserX size={16} />
              User Reports
            </button>
          </div>

          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              {loading && mode !== "reports" ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : mode === "reports" ? null : mode === "groups" ? (
                <div className="space-y-1">
                  {groups.length === 0 ? (
                    <p className="text-slate-500 text-sm p-4">No groups yet</p>
                  ) : (
                    groups.map((g) => (
                      <button
                        key={g._id}
                        onClick={() => loadGroupMessages(g._id)}
                        className={`w-full text-left p-3 rounded-xl transition ${
                          selectedGroup?._id === g._id ? "bg-slate-200" : "hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{g.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate text-sm">{g.name}</p>
                            <p className="text-xs text-slate-500">
                              {g.messageCount} msgs
                              {g.flaggedCount > 0 && (
                                <span className="text-amber-600 ml-1">• {g.flaggedCount} flagged</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : mode === "reports" ? (
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm p-4">User reports are listed in the main panel.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.length === 0 ? (
                    <p className="text-slate-500 text-sm p-4">No peer conversations yet</p>
                  ) : (
                    conversations.map((c) => {
                      const names = (c.participants || []).map((p) => p.name).filter(Boolean).join(", ") || "Anonymous";
                      return (
                        <button
                          key={c._id}
                          onClick={() => loadPeerMessages(c._id)}
                          className={`w-full text-left p-3 rounded-xl transition ${
                            selectedConversation?._id === c._id ? "bg-slate-200" : "hover:bg-slate-100"
                          }`}
                        >
                          <p className="font-medium text-slate-800 truncate text-sm">{names}</p>
                          <p className="text-xs text-slate-500">{c.messageCount} messages</p>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {mode === "reports" ? (
                <div className="p-6">
                  <h2 className="font-medium text-slate-800 mb-4">User reports</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                  ) : userReports.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-12">No user reports yet</p>
                  ) : (
                    <div className="space-y-3">
                      {userReports.map((r) => (
                        <div
                          key={r._id}
                          className={`p-4 rounded-xl ${
                            r.status === "pending" ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {r.reportedUser?.name || "Unknown"} reported by {r.reporter?.name || "Unknown"}
                              </p>
                              <p className="text-slate-600 text-sm mt-1">{r.reason}</p>
                              <p className="text-xs text-slate-400 mt-2">{formatDate(r.createdAt)}</p>
                              {r.status !== "pending" && (
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded mt-2 inline-block">
                                  {r.status}
                                </span>
                              )}
                            </div>
                            {r.status === "pending" && (
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleResolveUserReport(r._id, "resolved")}
                                  disabled={actionLoading === r._id}
                                  className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                  title="Resolve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleResolveUserReport(r._id, "dismissed")}
                                  disabled={actionLoading === r._id}
                                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                  title="Dismiss"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : messagesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : selectedGroup ? (
                <>
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="text-2xl">{selectedGroup.icon}</span>
                    <div>
                      <h2 className="font-medium text-slate-800">{selectedGroup.name}</h2>
                      <p className="text-xs text-slate-500">Group chat • All messages visible to moderators</p>
                    </div>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                    {groupMessages.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No messages in this group</p>
                    ) : (
                      groupMessages.map((m) => (
                        <div
                          key={m._id}
                          className={`p-3 rounded-xl ${
                            m.flagged ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-slate-700">{m.displayName}</span>
                              <span className="text-xs text-slate-400 ml-2">{formatDate(m.createdAt)}</span>
                              {m.flagged && (
                                <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                                  Flagged
                                </span>
                              )}
                              <p className="text-slate-600 text-sm mt-1">{m.content}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleFlagGroupMessage(m._id)}
                                disabled={actionLoading === m._id || m.flagged}
                                className="p-2 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-amber-600 disabled:opacity-50"
                                title="Flag"
                              >
                                <Flag size={16} />
                              </button>
                              <button
                                onClick={() => handleHideGroupMessage(m._id)}
                                disabled={actionLoading === m._id}
                                className="p-2 rounded-lg text-slate-500 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                                title="Hide"
                              >
                                <EyeOff size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : selectedConversation ? (
                <>
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="font-medium text-slate-800">
                      {(selectedConversation.participants || []).map((p) => p.name).filter(Boolean).join(" & ") || "Peer conversation"}
                    </h2>
                    <p className="text-xs text-slate-500">Direct message • Moderator view</p>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                    {peerMessages.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No messages in this conversation</p>
                    ) : (
                      peerMessages.map((m) => (
                        <div
                          key={m._id}
                          className={`p-3 rounded-xl ${
                            m.flagged ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-slate-700">{m.displayName}</span>
                              <span className="text-xs text-slate-400 ml-2">{formatDate(m.createdAt)}</span>
                              {m.flagged && (
                                <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                                  Flagged
                                </span>
                              )}
                              <p className="text-slate-600 text-sm mt-1">{m.content}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleFlagPeerMessage(m._id)}
                                disabled={actionLoading === m._id || m.flagged}
                                className="p-2 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-amber-600 disabled:opacity-50"
                                title="Flag"
                              >
                                <Flag size={16} />
                              </button>
                              <button
                                onClick={() => handleHidePeerMessage(m._id)}
                                disabled={actionLoading === m._id}
                                className="p-2 rounded-lg text-slate-500 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                                title="Hide"
                              >
                                <EyeOff size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <MessageCircle className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="text-sm">Select a group or conversation to view messages</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-700 font-medium">Chat moderation guidelines</p>
                <p className="text-xs text-slate-500 mt-1">
                  Flag concerning messages for review • Hide inappropriate content from participants • All chats are
                  monitored for safety • Crisis content: provide resources, consider outreach
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
