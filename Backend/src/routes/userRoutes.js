import express from "express";
import { getProfile, updateProfile, updatePassword, deleteAccount } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, updatePassword);
router.delete("/account", authMiddleware, deleteAccount);

export default router;
