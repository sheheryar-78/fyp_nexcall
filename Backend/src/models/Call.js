import mongoose from "mongoose";

const CallSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    callSid: { type: String }, // To link Twilio callbacks
    caller: {
      type: String,
      required: true,
      trim: true, // optional: extra spaces remove
    },
    agent: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "0s",
    },
    status: {
      type: String,
      enum: ["completed", "missed", "failed", "in-progress", "busy", "no-answer", "canceled"],
      default: "completed",
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    summary: {
      type: String,
      default: "Call processed by AI agent.",
    },
    transcript: {
      type: Array,
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // automatically createdAt & updatedAt
);

export default mongoose.models.Call || mongoose.model("Call", CallSchema);