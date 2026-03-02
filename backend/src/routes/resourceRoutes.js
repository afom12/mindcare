import express from "express";
import {
  getResources,
  toggleFavorite,
  getFavorites
} from "../controllers/resourceController.js";
import { protectRoute, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/resources", optionalAuth, getResources);
router.post("/resources/favorite", protectRoute, toggleFavorite);
router.get("/resources/favorites", protectRoute, getFavorites);

export default router;
