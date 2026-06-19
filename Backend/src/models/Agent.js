import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    voiceType: { type: String, default: "Rachel - Professional" },
    voiceProvider: { type: String, default: "ElevenLabs" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    documents: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);