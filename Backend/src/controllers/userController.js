import User from "../models/User.js";
import bcrypt from "bcrypt";

// GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, notifications } = req.body;
    
    // Check if new email is already used by someone else
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use." });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name, email, notifications },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// PUT /api/users/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one special character" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// DELETE /api/users/account
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    // Ideally, also delete associated agents, documents, and billing here.
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
