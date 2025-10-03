import { Router } from "express";
import { getFavoritesByUser, saveFavorite, deleteFavorite } from "../controllers/favorite.controller.js";

const router = Router();

router.get("/data", getFavoritesByUser)
router.post("/", saveFavorite);
router.delete("/delete-favorite", deleteFavorite);

export default router;