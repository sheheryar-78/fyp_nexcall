import express from "express"
const router = express.Router();
import { getStats } from "../controllers/dashboardController.js"

router.get("/stats", getStats);

export default router;