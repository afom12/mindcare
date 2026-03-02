import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Users, Send, Loader2, Flag } from "lucide-react";
import { communityApi } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";

function formatDate(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reporting, setReporting] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await communityApi.getPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Could not load community posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
        isAnonymous
      });
      setContent("");
      setError("");
      setSuccess("Your post has been submitted for review. It will appear in the community once approved.");
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

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-slate-800">Community Support</h1>
              <p className="text-slate-500 text-sm">Share your journey. You&apos;re not alone.</p>
            </div>
          </div>

          {user && (
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <textarea
                  placeholder="Share something that helped you, or a small win..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 resize-none"
                />
                <div className="flex flex-wrap items-center gap-3 mt-3">
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
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="ml-auto flex items-center gap-2 bg-slate-800 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Share
                  </button>
                </div>
                {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
                {success && (
                  <p className="text-green-600 text-sm mt-2 bg-green-50 px-3 py-2 rounded-lg">
                    {success}
                  </p>
                )}
              </div>
            </form>
          )}

          {!user && (
            <p className="text-slate-500 text-sm mb-6">
              Sign in to share your story with the community.
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <p className="text-slate-500">No stories yet. Be the first to share.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{post.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                      {user && (
                        <button
                          onClick={() => handleReport(post._id)}
                          disabled={reporting === post._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Report"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
