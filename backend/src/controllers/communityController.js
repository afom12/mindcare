import Post from "../models/Post.js";
import Report from "../models/Report.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "name")
      .lean();

    const sanitized = posts.map((p) => ({
      _id: p._id,
      displayName: p.isAnonymous ? "Anonymous" : p.displayName,
      content: p.content,
      createdAt: p.createdAt
    }));

    res.json({ posts: sanitized });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, displayName, isAnonymous } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const name = displayName?.trim() || req.user.name?.split(" ")[0] || "Someone";

    const post = await Post.create({
      author: userId,
      displayName: isAnonymous ? "Anonymous" : name,
      content: content.trim(),
      isAnonymous: !!isAnonymous
    });

    res.status(201).json({
      post: {
        _id: post._id,
        displayName: post.isAnonymous ? "Anonymous" : post.displayName,
        content: post.content,
        createdAt: post.createdAt,
        status: post.status
      }
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
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
