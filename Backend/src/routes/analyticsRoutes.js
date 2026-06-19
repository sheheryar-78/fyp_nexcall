import express from "express";
import Call from "../models/Call.js";
const router = express.Router();

// Real dynamic data for Last 7 Days
router.get("/weekly-calls", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const calls = await Call.find({
      createdAt: { $gte: sevenDaysAgo, $lte: today }
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Generate the last 7 days array in correct order
    const outputDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      outputDays.push(days[d.getDay()]);
    }
    
    const result = {};
    outputDays.forEach(day => result[day] = 0);

    calls.forEach(call => {
      if (call.createdAt) {
        const dayName = days[new Date(call.createdAt).getDay()];
        if (result[dayName] !== undefined) {
            result[dayName]++;
        }
      }
    });

    const data = outputDays.map(dayName => ({ day: dayName, calls: result[dayName] }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;