import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // optional: extra spaces remove karne ke liye
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // optional: email lowercase store karne ke liye
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  notifications: {
    emailSummary: { type: Boolean, default: true },
    limitAlerts: { type: Boolean, default: true },
    newFeatures: { type: Boolean, default: false },
  }
}, { timestamps: true }); // automatic createdAt & updatedAt

export default mongoose.models.User || mongoose.model("User", UserSchema);