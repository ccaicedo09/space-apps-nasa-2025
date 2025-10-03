import mongoose from "mongoose";
import Dataset from "../models/dataset.model.js";
import userModel from "../models/user.model.js";
import { getValidUserIdFromCookie } from "../utils/getUserFromCookie.js";

export const getFavoritesByUser = async (req, res) => {
  try {
    const userId = getValidUserIdFromCookie(req, res);
    if (!userId) return;

    // pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // fetch user and their favourites' identifiers
    const user = await userModel.findById(userId).select("identifiers_fav");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const total = user.identifiers_fav.length;
    const paginated = user.identifiers_fav.slice(skip, skip + limit);
    
    const favorites = await Dataset.find(
      { identifier: { $in: paginated } },
    ).lean();

    // sort favorites to match the order of paginated identifiers
    const orderMap = new Map(paginated.map((id, idx) => [id, idx]));
    favorites.sort((a, b) => (orderMap.get(a.identifier) ?? 0) - (orderMap.get(b.identifier) ?? 0))
    

    return res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      identifiers_fav: favorites
    });

  } catch (err) {
    console.error("GET error: ", err);
    return res.status(500).json({ error: "Internal server error." });
  }
} 

export const saveFavorite = async (req, res) => {
  try {
    // validate user from cookie
    const userId = req.cookies?._id_user;
    if (!userId) {
      return res.status(401).json({ error: "No auth cookie. Please login!" })
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID in cookie." });
    }

    // validate body
    const { identifier } = req.body || {};
    if (typeof identifier !== "string" || identifier.trim().length === 0) {
      return res.status(400).json({ error: "identifier is required (non-empty string)." });
    }
    const cleanIdentifier = identifier.trim();

    // validate user exists
    const user = await userModel.findById(userId).select("_id identifiers_fav");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // add like asuring it's unique
    const result = await userModel.updateOne(
      { _id: user._id },
      { $addToSet: { identifiers_fav: cleanIdentifier } }
    );

    const added = result.modifiedCount === 1;

    // return updated favs
    const updatedUser = await userModel.findById(user._id).select("identifiers_fav");

    return res.status(added ? 201 : 200).json({
      message: added ? "Like saved." : "Identifier already liked.",
      added,
      identifiers_fav: updatedUser.identifiers_fav
    });
  } catch (err) {
    console.error("POST /likes error:", err);
    return res.status(500).json({ error: "Internal server error." });
  } 
}

export const deleteFavorite = async (req, res) => {
  try {
    const userId = getValidUserIdFromCookie(req, res);
    if (!userId) return;

    if (typeof req.body.identifier !== "string" || req.body.identifier.trim().length === 0) {
      return res.status(400).json({ error: "Image's identifier is required (non-empty string)." });
    }

    const userLikes = await userModel.findById(userId).select("identifiers_fav");
    if (!userLikes) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!userLikes.identifiers_fav.includes(req.body.identifier.trim())) {
      return res.status(400).json({ error: "Image not in user's favorites." });
    }

    await userModel.updateOne(
      { _id: userId },
      { $pull: { identifiers_fav: req.body.identifier.trim() } }
    );

    return res.status(200).json({ message: "Favorite removed." });

  } catch (err) {
    console.error("DELETE /favorites error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}