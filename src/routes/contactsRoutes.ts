import { Router } from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddlewares";
import {
  addContact,
  fetchContacts,
  recentContacts,
} from "../controllers/contactsController";

const router = Router();
router.get("/", verifyToken, fetchContacts);
router.post("/", verifyToken, addContact);
router.get("/recent", verifyToken, recentContacts);

export default router;
