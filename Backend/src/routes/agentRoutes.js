import express from "express";
import {
  getAgents,
  createAgent,
  deleteAgent,
  updateAgent,
} from "../controllers/agentController.js";

const router = express.Router();

router.get("/", getAgents);
router.post("/", createAgent);
router.delete("/:id", deleteAgent);
router.put("/:id", updateAgent);

export default router;