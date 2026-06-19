import Call from "../models/Call.js";
import Agent from "../models/Agent.js";

// ---------------- Get Dashboard Stats ----------------
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total calls today
    const totalCalls = await Call.countDocuments({
      createdAt: { $gte: today },
    });

    // Active agents (dynamic) - Filter by logged-in user so they only see their own agents
    const activeAgents = await Agent.countDocuments({ userId: req.userId, status: "active" });

    // Satisfaction (derived from completed vs all calls)
    const totalAllCalls = await Call.countDocuments({});
    const completedCalls = await Call.countDocuments({ status: "completed" });
    const satisfactionScore = totalAllCalls === 0 ? 0 : ((completedCalls / totalAllCalls) * 5);
    const satisfaction = parseFloat(satisfactionScore.toFixed(1));

    // ⏱ Avg duration (in seconds)
    const calls = await Call.find({});
    let totalSeconds = 0;

    calls.forEach((c) => {
      const time = c.duration ? c.duration.replace("s", "") : "0";
      totalSeconds += parseInt(time) || 0;
    });

    const avgSeconds = calls.length
      ? Math.floor(totalSeconds / calls.length)
      : 0;

    res.json({
      totalCalls,
      activeAgents,
      satisfaction,
      avgDuration: `${avgSeconds}s`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};