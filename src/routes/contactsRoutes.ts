import { Router } from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddlewares";
import { addContact, fetchContacts } from "../controllers/contactsController";

const router = Router();
router.get("/", verifyToken, fetchContacts);
router.post("/", verifyToken, addContact);

export default router;
