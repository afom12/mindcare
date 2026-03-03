import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import {
  Users,
  MessageCircle,
  Heart,
  Flag,
  Search,
  Plus,
  TrendingUp,
  BookOpen,
  Shield,
  Lock,
  Calendar,
  Bell,
  Send,
  Loader2,
  X
} from "lucide-react";
import { communityApi, REACTION_EMOJIS } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";

const REACTION_KEYS = ["heart", "pray", "sprout", "hug"];

function formatDate(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

const DAILY_PROMPTS = [
  "What's one small thing that brought you peace today?",
  "What are you grateful for right now?",
  "What's one kind thing you did for yourself today?",
  "What helped you feel a little better this week?"
];

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [postGroup, setPostGroup] = useState("general");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reporting, setReporting] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [pinnedCommentId, setPinnedCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [reacting, setReacting] = useState(null);

  const dailyPrompt = DAILY_PROMPTS[new Date().getDate() % DAILY_PROMPTS.length];

  const handleTogglePostReaction = async (postId, emoji) => {
    if (!user || reacting) return;
    setReacting(`post-${postId}-${emoji}`);
    try {
      await communityApi.togglePostReaction(postId, emoji);
      loadPosts();
    } catch (err) {
      console.error("Reaction failed:", err);
    } finally {
      setReacting(null);
    }
  };

  const handleToggleCommentReaction = async (commentId, emoji) => {
    if (!user || !expandedPost || reacting) return;
    setReacting(`comment-${commentId}-${emoji}`);
    try {
      await communityApi.toggleCommentReaction(expandedPost, commentId, emoji);
      loadComments(expandedPost);
      loadPosts();
    } catch (err) {
      console.error("Reaction failed:", err);
    } finally {
      setReacting(null);
    }
  };

  const loadComments = async (postId) => {
    try {
      const { data } = await communityApi.getPostComments(postId);
      setComments(data.comments || []);
      const pinned = data.pinnedComment;
      setPinnedCommentId(pinned ? (typeof pinned === "object" ? pinned._id : pinned) : null);
      setExpandedPost(postId);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !expandedPost || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      await communityApi.addComment(expandedPost, commentText.trim());
      setCommentText("");
      loadComments(expandedPost);
      loadPosts();
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const loadGroups = async () => {
    try {
      const { data } = await communityApi.getGroups();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = selectedGroup ? { group: selectedGroup } : {};
      const { data } = await communityApi.getPosts(params);
      setPosts(data.posts || []);
      if (data.groups?.length) setGroups(data.groups);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Could not load community posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedGroup]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await communityApi.createPost({
        content: content.trim(),
        displayName: displayName.trim() || user?.name?.split(" ")[0],
        isAnonymous,
        group: postGroup
      });
      setContent("");
      setShowNewPost(false);
      setSuccess("Your post has been submitted for review. It will appear once approved.");
      loadPosts();
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.error || "Could not share your story.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (postId) => {
    const reason = window.prompt("Why are you reporting this post? (e.g. inappropriate content, harassment)");
    if (!reason?.trim()) return;
    setReporting(postId);
    try {
      await communityApi.reportPost(postId, reason.trim());
      setError("");
      alert("Thank you. Your report has been submitted for review.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit report.");
    } finally {
      setReporting(null);
    }
  };

  const categories = groups.length
    ? groups.map((g, i) => ({
        ...g,
        members: Math.floor(100 + Math.random() * 1500),
        posts: Math.floor(10 + Math.random() * 100),
        color: ["slate", "slate"][i % 2]
      }))
    : [
        { id: "anxiety", name: "Anxiety & Stress", icon: "🌿", members: 1243, posts: 89 },
        { id: "depression", name: "Depression & Mood", icon: "💭", members: 987, posts: 67 },
        { id: "trauma", name: "Trauma & PTSD", icon: "🧠", members: 654, posts: 42 },
        { id: "transitions", name: "Life Transitions", icon: "🌈", members: 876, posts: 54 },
        { id: "students", name: "Students & Academics", icon: "🎓", members: 1543, posts: 112 },
        { id: "lgbtq", name: "LGBTQ+ Support", icon: "🏳️‍🌈", members: 432, posts: 38 },
        { id: "wellness", name: "Wellness & Self-Care", icon: "🧘", members: 1098, posts: 76 },
        { id: "recovery", name: "Recovery & Sobriety", icon: "🤝", members: 321, posts: 29 }
      ];

  const trendingPosts = posts.slice(0, 5);
  const filteredPosts = searchQuery
    ? posts.filter(
        (p) =>
          p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-slate-800">
                Community <span className="text-slate-600 font-medium">Support</span>
              </h1>
              <p className="text-slate-500 mt-1">Connect with others who understand</p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                <Bell size={16} />
                Notifications
              </button>
              {user && (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700"
                >
                  <Plus size={16} />
                  New Post
                </button>
              )}
            </div>
          </div>

          {/* Safety Notice Banner */}
          <div className="mb-6 bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-800 font-medium">This is a safe, moderated space</p>
              <p className="text-xs text-slate-600 mt-1">
                All posts are reviewed for safety. If you&apos;re in crisis, please call 988 or text HOME to 741741.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions, groups, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
            {[
              { id: "discover", label: "Discover", icon: Users },
              { id: "my-groups", label: "My Groups", icon: Heart },
              { id: "trending", label: "Trending", icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-slate-800 text-slate-800"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <Link
              to="/resources"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700"
            >
              <BookOpen size={16} />
              Resources
            </Link>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Groups & Posts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => {
                      setSelectedGroup(selectedGroup === category.id ? null : category.id);
                      setActiveTab("discover");
                    }}
                    className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition cursor-pointer ${
                      selectedGroup === category.id ? "border-slate-400 ring-1 ring-slate-200" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                        {category.icon}
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {category.members} members
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">{category.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{category.posts} discussions today</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 hover:text-slate-800">
                        {selectedGroup === category.id ? "Viewing" : "View"}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Lock size={12} /> Moderated
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trending / Feed */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-slate-800">
                    {activeTab === "trending" ? "Trending discussions" : "Recent discussions"}
                  </h3>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No discussions yet. Be the first to share.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(activeTab === "trending" ? trendingPosts : filteredPosts).map((post) => (
                      <div
                        key={post._id}
                        className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-slate-700 text-sm leading-relaxed flex-1">{post.content}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                              {user && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReport(post._id);
                                  }}
                                  disabled={reporting === post._id}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                  title="Report"
                                >
                                  <Flag className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs flex-wrap">
                            <span className="text-slate-500">Posted by {post.displayName}</span>
                            {post.group && (
                              <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{post.group}</span>
                            )}
                            <button
                              onClick={() =>
                                expandedPost === post._id ? setExpandedPost(null) : loadComments(post._id)
                              }
                              className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
                            >
                              <MessageCircle size={12} />
                              {post.commentCount ?? 0} comments
                            </button>
                            {post.reactions && (
                              <div className="flex items-center gap-1 ml-auto">
                                {REACTION_KEYS.map((key) => {
                                  const r = post.reactions[key];
                                  const count = r?.count ?? 0;
                                  const isActive = post.userReactions?.includes(key);
                                  const canReact = !!user;
                                  return (
                                    <button
                                      key={key}
                                      onClick={() => canReact && handleTogglePostReaction(post._id, key)}
                                      disabled={!canReact || reacting !== null}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition ${
                                        isActive
                                          ? "bg-slate-200 text-slate-800"
                                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                      } ${!canReact ? "cursor-default" : ""}`}
                                      title={key}
                                    >
                                      <span>{REACTION_EMOJIS[key]}</span>
                                      {count > 0 && <span className="text-xs">{count}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {expandedPost === post._id && (
                          <div className="border-t border-slate-200 bg-white p-4">
                            <div className="space-y-3 mb-4">
                              {comments.length === 0 ? (
                                <p className="text-slate-500 text-sm">No comments yet. Be the first to support.</p>
                              ) : (
                                [...comments]
                                  .sort((a, b) =>
                                    pinnedCommentId === a._id ? -1 : pinnedCommentId === b._id ? 1 : 0
                                  )
                                  .map((c) => (
                                    <div
                                      key={c._id}
                                      className={`p-3 rounded-xl ${
                                        pinnedCommentId === c._id ? "bg-slate-200 border border-slate-300" : "bg-slate-50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-slate-700">{c.displayName}</span>
                                        {c.isTherapist && (
                                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                            Therapist
                                          </span>
                                        )}
                                        {pinnedCommentId === c._id && (
                                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                            Pinned
                                          </span>
                                        )}
                                        <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                                      </div>
                                      <p className="text-slate-600 text-sm mt-1">{c.content}</p>
                                      {c.reactions && (
                                        <div className="flex items-center gap-1 mt-2">
                                          {REACTION_KEYS.map((key) => {
                                            const r = c.reactions[key];
                                            const count = r?.count ?? 0;
                                            const isActive = c.userReactions?.includes(key);
                                            const canReact = !!user;
                                            return (
                                              <button
                                                key={key}
                                                onClick={() => canReact && handleToggleCommentReaction(c._id, key)}
                                                disabled={!canReact || reacting !== null}
                                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition ${
                                                  isActive
                                                    ? "bg-slate-200 text-slate-800"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                } ${!canReact ? "cursor-default" : ""}`}
                                                title={key}
                                              >
                                                <span>{REACTION_EMOJIS[key]}</span>
                                                {count > 0 && <span>{count}</span>}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ))
                              )}
                            </div>
                            {user && (
                              <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a supportive comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400"
                                />
                                <button
                                  type="submit"
                                  disabled={commentSubmitting || !commentText.trim()}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
                                >
                                  {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
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
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Your Stats */}
              <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-6 text-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Your community</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Posts</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Comments</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Support given</span>
                    <span className="font-semibold">0 ❤️</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Reputation</span>
                    <span className="font-semibold">🌱 New</span>
                  </div>
                </div>
              </div>

              {/* Peer Support Options */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Connect privately</h3>
                <div className="space-y-3">
                  <Link
                    to="/community/chat"
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Group chats</span>
                    </div>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">Chat</span>
                  </Link>
                  <Link
                    to="/community/chat"
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Direct messages</span>
                    </div>
                    <span className="text-xs text-slate-400">From groups</span>
                  </Link>
                  <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Live support sessions</span>
                    </div>
                    <span className="text-xs text-slate-400">Coming soon</span>
                  </button>
                </div>
              </div>

              {/* Daily Prompt */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Daily prompt</h3>
                <p className="text-slate-700 text-lg font-light italic mb-4">&quot;{dailyPrompt}&quot;</p>
                {user ? (
                  <button
                    onClick={() => setShowNewPost(true)}
                    className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-sm hover:bg-slate-200 transition"
                  >
                    Share your response
                  </button>
                ) : (
                  <p className="text-sm text-slate-500">Sign in to share your response</p>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Community guidelines</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Be kind • No judgment • Respect privacy • Report concerns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-400 mt-8 text-center">
            This community is moderated 24/7. If you&apos;re in crisis, please call 988.
          </p>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-slate-800">New Post</h2>
              <button
                onClick={() => setShowNewPost(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Group</label>
                <select
                  value={postGroup}
                  onChange={(e) => setPostGroup(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Share something that helped you, or a small win..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 resize-none mb-4"
              />
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Post anonymously
                </label>
                {!isAnonymous && (
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-40"
                  />
                )}
              </div>
              {error && <p className="text-rose-600 text-sm mb-2">{error}</p>}
              {success && (
                <p className="text-green-600 text-sm mb-2 bg-green-50 px-3 py-2 rounded-lg">{success}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-2 px-4 rounded-xl hover:bg-slate-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
