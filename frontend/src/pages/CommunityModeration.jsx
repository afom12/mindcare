import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Shield,
  AlertTriangle,
  Check,
  X,
  MessageCircle,
  Flag,
  Pin,
  Send,
  Loader2,
  ChevronDown,
  Users,
  FileWarning
} from "lucide-react";
import { communityModerationApi } from "../api/communityModerationApi";

function formatDate(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

const GROUPS_MAP = {
  anxiety: "🌿 Anxiety & Stress",
  depression: "💭 Depression & Mood",
  trauma: "🧠 Trauma & PTSD",
  transitions: "🌈 Life Transitions",
  students: "🎓 Students & Academics",
  lgbtq: "🏳️‍🌈 LGBTQ+ Support",
  wellness: "🧘 Wellness & Self-Care",
  recovery: "🤝 Recovery & Sobriety",
  general: "💬 General Support"
};

export default function CommunityModeration() {
  const [tab, setTab] = useState("pending");
  const [group, setGroup] = useState("");
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, crisisCount: 0, reportPendingCount: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [reportsTab, setReportsTab] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const params = { tab };
      if (group) params.group = group;
      const { data } = await communityModerationApi.getQueue(params);
      setPosts(data.posts || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const { data } = await communityModerationApi.getReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    if (reportsTab) {
      loadReports();
    } else {
      loadQueue();
    }
  }, [tab, group, reportsTab]);

  const loadComments = async (postId) => {
    try {
      const { data } = await communityModerationApi.getPostComments(postId);
      setComments(data.comments || []);
      setExpandedPost(postId);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleApprove = async (postId) => {
    setActionLoading(postId);
    try {
      await communityModerationApi.approvePost(postId);
      loadQueue();
      setExpandedPost(null);
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId) => {
    setActionLoading(postId);
    try {
      await communityModerationApi.rejectPost(postId);
      loadQueue();
      setExpandedPost(null);
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !expandedPost || submitting) return;
    setSubmitting(true);
    try {
      await communityModerationApi.addComment(expandedPost, commentText.trim());
      setCommentText("");
      loadComments(expandedPost);
      loadQueue();
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinComment = async (postId, commentId) => {
    try {
      await communityModerationApi.pinComment(postId, commentId);
      loadComments(postId);
      loadQueue();
    } catch (err) {
      console.error("Pin failed:", err);
    }
  };

  const handleUnpinComment = async (postId) => {
    try {
      await communityModerationApi.unpinComment(postId);
      loadComments(postId);
      loadQueue();
    } catch (err) {
      console.error("Unpin failed:", err);
    }
  };

  const handleResolveReport = async (reportId, action, note = "") => {
    try {
      await communityModerationApi.resolveReport(reportId, action, note);
      loadReports();
      loadQueue();
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-slate-800">
                Community <span className="font-medium text-slate-700">Moderation</span>
              </h1>
              <p className="text-slate-500 mt-1">
                Review posts, support the community, and maintain safety
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FileWarning className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-800">{stats.pendingCount}</p>
                  <p className="text-sm text-slate-500">Pending posts</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-800">{stats.crisisCount}</p>
                  <p className="text-sm text-slate-500">Crisis flagged</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Flag className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-800">{stats.reportPendingCount}</p>
                  <p className="text-sm text-slate-500">Reports to review</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setReportsTab(false)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                !reportsTab ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users size={16} />
              Posts
            </button>
            <button
              onClick={() => setReportsTab(true)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                reportsTab ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Flag size={16} />
              Reports
            </button>
          </div>

          {reportsTab ? (
            /* Reports list */
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100">
                  No pending reports
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-500 mb-1">
                          Reported by {r.reporterName} • {formatDate(r.createdAt)}
                        </p>
                        <p className="text-slate-700 mb-2">&quot;{r.reason}&quot;</p>
                        <p className="text-slate-600 text-sm line-clamp-2 bg-slate-50 p-3 rounded-lg">
                          Post: {r.postContent}...
                        </p>
                        <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          Status: {r.postStatus}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResolveReport(r._id, "dismiss", "Dismissed")}
                          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(r._id, "remove", "Post removed")}
                          className="px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"
                        >
                          Remove post
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Post queue tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {["pending", "crisis", "approved", "rejected"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      tab === t
                        ? "bg-slate-800 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">All groups</option>
                  {Object.entries(GROUPS_MAP).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Posts list */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-100">
                  No posts in this queue
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                        post.crisisFlag ? "border-rose-200" : "border-slate-100"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-medium text-slate-700">
                                {post.displayName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {GROUPS_MAP[post.group] || post.group}
                              </span>
                              <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                              {post.crisisFlag && (
                                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle size={12} /> Crisis
                                </span>
                              )}
                              {post.reportCount > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {post.reportCount} report(s)
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
                          </div>
                          {tab !== "rejected" && (
                            <div className="flex gap-2 flex-shrink-0">
                              {post.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(post._id)}
                                    disabled={actionLoading === post._id}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 disabled:opacity-50"
                                  >
                                    {actionLoading === post._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(post._id)}
                                    disabled={actionLoading === post._id}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm hover:bg-rose-200 disabled:opacity-50"
                                  >
                                    <X size={14} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            expandedPost === post._id
                              ? setExpandedPost(null)
                              : loadComments(post._id)
                          }
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                        >
                          <MessageCircle size={16} />
                          {post.commentCount} comments
                          <ChevronDown
                            size={16}
                            className={`transition ${expandedPost === post._id ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      {expandedPost === post._id && (
                        <div className="border-t border-slate-100 bg-slate-50 p-6">
                          <div className="space-y-4 mb-4">
                            {comments.length === 0 ? (
                              <p className="text-slate-500 text-sm">No comments yet</p>
                            ) : (
                              comments.map((c) => (
                                <div
                                  key={c._id}
                                  className={`p-3 rounded-xl ${
                                    post.pinnedComment?._id === c._id
                                      ? "bg-slate-200 border border-slate-300"
                                      : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-slate-700">
                                      {c.displayName}
                                      {c.isTherapist && (
                                        <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                          Therapist
                                        </span>
                                      )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400">
                                        {formatDate(c.createdAt)}
                                      </span>
                                      {post.pinnedComment?._id === c._id ? (
                                        <button
                                          onClick={() => handleUnpinComment(post._id)}
                                          className="text-xs text-slate-600 hover:text-slate-800"
                                        >
                                          Unpin
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handlePinComment(post._id, c._id)}
                                          className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
                                        >
                                          <Pin size={12} /> Pin
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-slate-600 text-sm mt-1">{c.content}</p>
                                </div>
                              ))
                            )}
                          </div>

                          {post.status === "approved" && (
                            <form onSubmit={handleAddComment} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a supportive comment (public)..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400"
                              />
                              <button
                                type="submit"
                                disabled={submitting || !commentText.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
                              >
                                {submitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send size={16} />
                                )}
                                Comment
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Guidelines reminder */}
          <div className="mt-8 bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-700 font-medium">Moderation guidelines</p>
                <p className="text-xs text-slate-500 mt-1">
                  Support the community publicly only • Never DM users • Crisis posts: provide resources, consider
                  outreach • Pin helpful therapist comments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
