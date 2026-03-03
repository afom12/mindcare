import Post from "../models/Post.js";
import Report from "../models/Report.js";
import Comment from "../models/Comment.js";
import Reaction from "../models/Reaction.js";
import { detectCrisis } from "../services/crisisDetection.js";

const REACTION_EMOJIS = { heart: "❤️", pray: "🙏", sprout: "🌱", hug: "🫂" };

const GROUPS = [
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

export const getGroups = (req, res) => {
  res.json({ groups: GROUPS });
};

export const getPosts = async (req, res) => {
  try {
    const { group } = req.query;
    const query = { status: "approved" };
    if (group) query.group = group;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "name")
      .populate("pinnedComment")
      .lean();

    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds }, status: "approved" } },
      { $group: { _id: "$post", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(commentCounts.map((c) => [c._id.toString(), c.count]));

    const postReactions = await Reaction.aggregate([
      { $match: { targetType: "post", targetId: { $in: postIds } } },
      { $group: { _id: { targetId: "$targetId", emoji: "$emoji" }, count: { $sum: 1 } } }
    ]);
    const reactionMap = {};
    postReactions.forEach((r) => {
      const id = r._id.targetId.toString();
      if (!reactionMap[id]) reactionMap[id] = {};
      reactionMap[id][r._id.emoji] = r.count;
    });

    const userId = req.user?._id?.toString();
    let userReactions = {};
    if (userId) {
      const userReacts = await Reaction.find({
        user: userId,
        targetType: "post",
        targetId: { $in: postIds }
      }).lean();
      userReacts.forEach((r) => {
        const id = r.targetId.toString();
        if (!userReactions[id]) userReactions[id] = [];
        userReactions[id].push(r.emoji);
      });
    }

    const sanitized = posts.map((p) => {
      const id = p._id.toString();
      const reactions = {};
      ["heart", "pray", "sprout", "hug"].forEach((e) => {
        reactions[e] = { count: reactionMap[id]?.[e] || 0, emoji: REACTION_EMOJIS[e] };
      });
      return {
        _id: p._id,
        displayName: p.isAnonymous ? "Anonymous" : p.displayName,
        content: p.content,
        group: p.group || "general",
        commentCount: countMap[id] || 0,
        pinnedComment: p.pinnedComment,
        reactions,
        userReactions: userReactions[id] || [],
        createdAt: p.createdAt
      };
    });

    res.json({ posts: sanitized, groups: GROUPS });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, displayName, isAnonymous, group } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const name = displayName?.trim() || req.user.name?.split(" ")[0] || "Someone";
    const validGroup = GROUPS.some((g) => g.id === group) ? group : "general";

    const contentTrimmed = content.trim();
    const crisis = detectCrisis(contentTrimmed);

    const postData = {
      author: userId,
      displayName: isAnonymous ? "Anonymous" : name,
      content: contentTrimmed,
      isAnonymous: !!isAnonymous,
      group: validGroup
    };

    if (crisis) {
      postData.crisisFlag = true;
      postData.crisisLevel = crisis.riskLevel === "critical" ? "critical" : "high";
      postData.crisisDetectedAt = new Date();
      postData.crisisCategory = crisis.category;
      postData.status = "pending";
    }

    const post = await Post.create(postData);

    res.status(201).json({
      post: {
        _id: post._id,
        displayName: post.isAnonymous ? "Anonymous" : post.displayName,
        content: post.content,
        group: post.group,
        createdAt: post.createdAt,
        status: post.status
      }
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.status !== "approved") return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({ post: postId, status: "approved" })
      .sort({ createdAt: 1 })
      .populate("author", "name role")
      .lean();

    const commentIds = comments.map((c) => c._id);
    const commentReactions = await Reaction.aggregate([
      { $match: { targetType: "comment", targetId: { $in: commentIds } } },
      { $group: { _id: { targetId: "$targetId", emoji: "$emoji" }, count: { $sum: 1 } } }
    ]);
    const reactionMap = {};
    commentReactions.forEach((r) => {
      const id = r._id.targetId.toString();
      if (!reactionMap[id]) reactionMap[id] = {};
      reactionMap[id][r._id.emoji] = r.count;
    });

    const userId = req.user?._id?.toString();
    let userReactions = {};
    if (userId) {
      const userReacts = await Reaction.find({
        user: userId,
        targetType: "comment",
        targetId: { $in: commentIds }
      }).lean();
      userReacts.forEach((r) => {
        const id = r.targetId.toString();
        if (!userReactions[id]) userReactions[id] = [];
        userReactions[id].push(r.emoji);
      });
    }

    const sanitized = comments.map((c) => {
      const id = c._id.toString();
      const reactions = {};
      ["heart", "pray", "sprout", "hug"].forEach((e) => {
        reactions[e] = { count: reactionMap[id]?.[e] || 0, emoji: REACTION_EMOJIS[e] };
      });
      return {
        _id: c._id,
        displayName: c.displayName,
        content: c.content,
        isTherapist: c.isTherapist || false,
        reactions,
        userReactions: userReactions[id] || [],
        createdAt: c.createdAt
      };
    });

    res.json({ comments: sanitized, pinnedComment: post.pinnedComment });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.status !== "approved") return res.status(400).json({ error: "Cannot comment on unapproved post" });

    const isTherapist = user.role === "therapist" || user.role === "admin";
    const displayName = isTherapist ? user.name : (user.name?.split(" ")[0] || "Someone");

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

export const toggleReaction = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const validEmojis = ["heart", "pray", "sprout", "hug"];
    if (!emoji || !validEmojis.includes(emoji)) {
      return res.status(400).json({ error: "Valid emoji required: heart, pray, sprout, hug" });
    }

    let targetType, targetId, targetModel;
    if (commentId) {
      const comment = await Comment.findOne({ _id: commentId, post: postId });
      if (!comment) return res.status(404).json({ error: "Comment not found" });
      targetType = "comment";
      targetId = commentId;
      targetModel = "Comment";
    } else {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.status !== "approved") return res.status(400).json({ error: "Cannot react to unapproved post" });
      targetType = "post";
      targetId = postId;
      targetModel = "Post";
    }

    const existing = await Reaction.findOne({
      user: userId,
      targetType,
      targetId,
      emoji
    });

    if (existing) {
      await Reaction.findByIdAndDelete(existing._id);
      return res.json({ action: "removed", emoji });
    }

    await Reaction.create({
      user: userId,
      targetType,
      targetId,
      targetModel,
      emoji
    });
    return res.json({ action: "added", emoji });
  } catch (error) {
    console.error("TOGGLE REACTION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;
    const userId = req.user._id;
    if (!postId || !reason?.trim()) {
      return res.status(400).json({ error: "postId and reason are required" });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const existing = await Report.findOne({ postId, reporterId: userId });
    if (existing) return res.status(400).json({ error: "You have already reported this post" });
    const report = await Report.create({ postId, reporterId: userId, reason: reason.trim() });
    res.status(201).json({ report });
  } catch (error) {
    console.error("REPORT POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
