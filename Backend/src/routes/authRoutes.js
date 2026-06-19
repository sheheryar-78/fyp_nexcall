import express from "express"
const router = express.Router();
import { signup, login, resetPassword } from "../controllers/authController.js"

router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);

export default router;