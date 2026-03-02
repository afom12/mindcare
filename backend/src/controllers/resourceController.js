import Resource from "../models/Resource.js";
import Favorite from "../models/Favorite.js";

export const getResources = async (req, res) => {
  try {
    const { search, type, category } = req.query;
    const userId = req.user?._id;

    let query = {};

    if (type) query.type = type;
    if (category) query.category = new RegExp(category, "i");

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { description: searchRegex }
      ];
    }

    const resources = await Resource.find(query).sort({ type: 1, title: 1 }).lean();

    let favoriteIds = [];
    if (userId) {
      const favs = await Favorite.find({ userId }).lean();
      favoriteIds = favs.map((f) => f.resourceId.toString());
    }

    const withFav = resources.map((r) => ({
      ...r,
      isFavorite: favoriteIds.includes(r._id.toString())
    }));

    const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))].sort();

    res.json({ resources: withFav, categories });
  } catch (error) {
    console.error("GET RESOURCES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({ error: "resourceId is required" });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const existing = await Favorite.findOne({ userId, resourceId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ favorited: false });
    } else {
      await Favorite.create({ userId, resourceId });
      return res.json({ favorited: true });
    }
  } catch (error) {
    console.error("TOGGLE FAVORITE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favs = await Favorite.find({ userId })
      .populate("resourceId")
      .lean();
    const resources = favs
      .filter((f) => f.resourceId)
      .map((f) => ({ ...f.resourceId, isFavorite: true }));
    res.json({ resources });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
