import mongoose from "mongoose";

export const getValidUserIdFromCookie = (req, res) => {
  const userId = req.cookies?._id_user;
  if (!userId) {
  res.status(401).json({ error: "No auth cookie. Please login!" });
  return null;
  }
  if (!mongoose.isValidObjectId(userId)) {
  res.status(400).json({ error: "Invalid user ID in cookie." });
  return null;
  }
  return userId;
};