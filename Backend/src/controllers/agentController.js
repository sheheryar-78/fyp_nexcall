import Agent from "../models/Agent.js";
import Billing from "../models/Billing.js";

// 🔹 Get all agents (ONLY current user agents)
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Create agent (we will add Twilio here NEXT step)
export const createAgent = async (req, res) => {
  try {
    const billing = await Billing.findOne({ userId: req.userId });
    if (billing && billing.usedAgents >= billing.maxAgents) {
      return res.status(403).json({ message: "Plan limit reached. Please upgrade to add more agents." });
    }

    const agent = new Agent({
      ...req.body,
      userId: req.userId, // IMPORTANT (multi-user support)
      status: req.body.status || "inactive",
      documents: req.body.documents || [],
    });

    const saved = await agent.save();

    if (billing) {
      billing.usedAgents += 1;
      await billing.save();
    }

    res.status(201).json(saved);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🔹 Delete agent
export const deleteAgent = async (req, res) => {
  try {
    const deleted = await Agent.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // security (user deletes only own agent)
    });

    if (deleted) {
      const billing = await Billing.findOne({ userId: req.userId });
      if (billing && billing.usedAgents > 0) {
        billing.usedAgents -= 1;
        await billing.save();
      }
    }

    res.json({ message: "Agent deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update agent
export const updateAgent = async (req, res) => {
  try {
    // 🔥 NEW: Check if trying to activate an agent while another is already active
    if (req.body.status === "active") {
      const activeAgent = await Agent.findOne({
        userId: req.userId,
        status: "active",
        _id: { $ne: req.params.id }
      });

      if (activeAgent) {
        return res.status(400).json({
          message: `Agent "${activeAgent.name}" is already active. Please disable it first.`
        });
      }
    }

    const updated = await Agent.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId, // security
      },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};