import { Router } from "express";
import { recoverPassword, setPassword } from "../controllers/recovery.controller.js";

const router = Router();

router.put("/generate", recoverPassword);
router.put("/", setPassword);

export default router