import express from "express"
const router = express.Router();
import { getCalls, createCall, rateCall } from "../controllers/callController.js"

router.get("/", getCalls);
router.post("/", createCall); // testing ke liye
router.put("/:id/rate", rateCall); // For rating calls from UI

export default router;