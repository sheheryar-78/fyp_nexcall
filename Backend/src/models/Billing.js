import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    currentPlan: { type: String, default: "Starter" },
    usedMinutes: { type: Number, default: 0 },
    monthlyMinutes: { type: Number, default: 1000 },
    usedAgents: { type: Number, default: 0 },
    maxAgents: { type: Number, default: 3 },
    usedDocuments: { type: Number, default: 0 },
    maxDocuments: { type: Number, default: 3 },
    paymentMethod: {
      cardNumber: { type: String, default: "4242" },
      expiry: { type: String, default: "12/25" },
    },
    paymentHistory: {
      type: Array,
      default: [
        {
          date: "Oct 1, 2026",
          invoice: "INV-2026-001",
          amount: "$49.00",
          status: "Paid",
        }
      ],
    },
    stripeCustomerId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Billing", billingSchema);
