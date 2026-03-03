import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";

const GROUPS_LIST = [
  { id: "anxiety", name: "Anxiety & Stress", icon: "🌿" },
  { id: "depression", name: "Depression & Mood", icon: "💭" },
  { id: "trauma", name: "Trauma & PTSD", icon: "🧠" },
  { id: "transitions", name: "Life Transitions", icon: "🌈" },
  { id: "students", name: "Students & Academics", icon: "🎓" },
  { id: "lgbtq", name: "LGBTQ+ Support", icon: "🏳️‍🌈" },
  { id: "wellness", name: "Wellness & Self-Care", icon: "🧘" },
  { id: "recovery", name: "Recovery & Sobriety", icon: "🤝" },
  { id: "general", name: "General Support", icon: "💬" }
];

export const getModerationQueue = async (req, res) => {
  try {
    const { tab = "pending", group } = req.query;

    const query = {};
    if (group) query.group = group;

    if (tab === "pending") {
      query.status = "pending";
    } else if (tab === "approved") {
      query.status = "approved";
    } else if (tab === "rejected") {
      query.status = "rejected";
    } else if (tab === "crisis") {
      query.crisisFlag = true;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "name")
      .populate("pinnedComment")
      .lean();

    const postIds = posts.map((p) => p._id);
    const commentsByPost = await Comment.aggregate([
      { $match: { post: { $in: postIds }, status: "approved" } },
      { $group: { _id: "$post", count: { $sum: 1 } } }
    ]);
    const commentCounts = Object.fromEntries(commentsByPost.map((c) => [c._id.toString(), c.count]));

    const reportCounts = await Report.aggregate([
      { $match: { postId: { $in: postIds }, status: "pending" } },
      { $group: { _id: "$postId", count: { $sum: 1 } } }
    ]);
    const reportCountMap = Object.fromEntries(reportCounts.map((r) => [r._id.toString(), r.count]));

    const sanitized = posts.map((p) => ({
      _id: p._id,
      displayName: p.isAnonymous ? "Anonymous" : p.displayName,
      content: p.content,
      group: p.group || "general",
      status: p.status,
      crisisFlag: p.crisisFlag || false,
      crisisLevel: p.crisisLevel,
      crisisCategory: p.crisisCategory,
      crisisDetectedAt: p.crisisDetectedAt,
      pinnedComment: p.pinnedComment,
      commentCount: commentCounts[p._id.toString()] || 0,
      reportCount: reportCountMap[p._id.toString()] || 0,
      createdAt: p.createdAt
    }));

    const [pendingCount, crisisCount, reportPendingCount] = await Promise.all([
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ crisisFlag: true, status: { $ne: "rejected" } }),
      Report.countDocuments({ status: "pending" })
    ]);

    res.json({
      posts: sanitized,
      groups: GROUPS_LIST,
      stats: { pendingCount, crisisCount, reportPendingCount }
    });
  } catch (error) {
    console.error("GET MODERATION QUEUE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const approvePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.status = "approved";
    await post.save();

    res.json({ post: { _id: post._id, status: "approved" } });
  } catch (error) {
    console.error("APPROVE POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body || {};
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.status = "rejected";
    await post.save();

    res.json({ post: { _id: post._id, status: "rejected" } });
  } catch (error) {
    console.error("REJECT POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.status !== "approved") {
      return res.status(400).json({ error: "Cannot comment on unapproved post" });
    }

    const isTherapist = user.role === "therapist" || user.role === "admin";
    const displayName = isTherapist ? user.name : (post.isAnonymous ? "Anonymous" : user.name?.split(" ")[0] || "Someone");

    const comment = await Comment.create({
      post: postId,
      author: user._id,
      displayName,
      content: content.trim(),
      isAnonymous: false,
      isTherapist,
      status: "approved"
    });

    res.status(201).json({
      comment: {
        _id: comment._id,
        displayName: comment.displayName,
        content: comment.content,
        isTherapist: comment.isTherapist,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const pinComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.findOne({ _id: commentId, post: postId });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    post.pinnedComment = commentId;
    await post.save();

    res.json({ post: { _id: post._id, pinnedComment: commentId } });
  } catch (error) {
    console.error("PIN COMMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const unpinComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.pinnedComment = null;
    await post.save();

    res.json({ post: { _id: post._id, pinnedComment: null } });
  } catch (error) {
    console.error("UNPIN COMMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPostCommentsModeration = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId, status: "approved" })
      .sort({ createdAt: 1 })
      .populate("author", "name role")
      .lean();

    const sanitized = comments.map((c) => ({
      _id: c._id,
      displayName: c.displayName,
      content: c.content,
      isTherapist: c.isTherapist || false,
      createdAt: c.createdAt
    }));

    const post = await Post.findById(postId).select("pinnedComment").lean();
    res.json({ comments: sanitized, pinnedComment: post?.pinnedComment });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("postId")
      .populate("reporterId", "name")
      .lean();

    const reportsWithPost = reports
      .filter((r) => r.postId)
      .map((r) => ({
        _id: r._id,
        postId: r.postId._id,
        postContent: r.postId.content?.slice(0, 100),
        postStatus: r.postId.status,
        reporterName: r.reporterId?.name || "Unknown",
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt
      }));

    res.json({ reports: reportsWithPost });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, note } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.status = action === "dismiss" ? "dismissed" : "resolved";
    report.resolvedBy = req.user._id;
    report.resolutionNote = note || "";
    await report.save();

    if (action === "remove" && report.postId) {
      await Post.findByIdAndUpdate(report.postId, { status: "rejected" });
    }

    res.json({ report: { _id: report._id, status: report.status } });
  } catch (error) {
    console.error("RESOLVE REPORT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
