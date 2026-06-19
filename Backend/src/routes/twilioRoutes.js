/* import express from "express";
import { handleIncomingCall } from "../controllers/twilioController.js";

const router = express.Router();

// ✅ BOTH methods allow karo
router.post("/voice", handleIncomingCall);
router.get("/voice", handleIncomingCall); // 🔥 ADD THIS

export default router; */

import express from "express";
import { handleIncomingCall, processAudio, getConfig, handleCallStatus } from "../controllers/twilioController.js";

const router = express.Router();

router.post("/voice", handleIncomingCall);
router.post("/process-audio", processAudio);
router.post("/status", handleCallStatus); // 🔥 NEW: Handle Call Status
router.get("/config", getConfig);

export default router;