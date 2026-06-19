import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fileName: String,
    fileUrl: String,
    size: String,
    status: {
      type: String,
      enum: ["processing", "vectorized", "failed"],
      default: "processing",
    },
    errorMessage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);