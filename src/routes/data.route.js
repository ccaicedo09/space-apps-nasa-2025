import { Router } from "express";
import { getData } from "../controllers/data.controller.js";

const router = Router();

router.get("/", getData);

export default router;