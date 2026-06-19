import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Important for Twilio form-data
app.use(express.static(path.join(__dirname, "../public"))); // Serve audio files

app.get("/", (req, res) => {
  res.send("NexCall Backend Running");
});

// IMPORTS
import authMiddleware from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import twilioRoutes from "./routes/twilioRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import documentRoutes from "./routes/documentRoutes.js"; 
import billingRoutes from "./routes/billingRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // NEW

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // NEW
app.use("/api/agents", authMiddleware, agentRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/calls", authMiddleware, callRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/documents", authMiddleware, documentRoutes);
app.use("/api/billing", authMiddleware, billingRoutes);

export default app;