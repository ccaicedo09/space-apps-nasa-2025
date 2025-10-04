import { Router } from "express";
import { explainAI } from "../controllers/ai.controller.js";

const router = Router();

router.get("/explain", explainAI);

export default router;