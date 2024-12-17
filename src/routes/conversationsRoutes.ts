import { Router } from "express";

import { verifyToken } from "../middlewares/authMiddlewares";
import {
  checkOrCreateConversation,
  fetchAllConversationsByUserId,
  getDailyQuestion,
} from "../controllers/conversationsController";
const router = Router();
router.get("/", verifyToken, fetchAllConversationsByUserId);
router.post("/check-or-create", verifyToken, checkOrCreateConversation);
router.get("/:id/daily-question", verifyToken, getDailyQuestion);

export default router;
