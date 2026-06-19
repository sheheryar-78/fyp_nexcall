import Call from "../models/Call.js";

// ---------------- Get all calls ----------------
export const getCalls = async (req, res) => {
  try {
    const calls = await Call.find({}).sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Create a new call (for testing) ----------------
export const createCall = async (req, res) => {
  try {
    const { caller, agent, duration, status } = req.body;

    const newCall = new Call({
      userId: req.userId,
      caller,
      agent,
      duration,
      status,
    });

    await newCall.save();
    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Rate a call ----------------
export const rateCall = async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const updatedCall = await Call.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { rating },
      { new: true }
    );

    if (!updatedCall) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.json(updatedCall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};