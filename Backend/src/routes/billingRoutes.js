import express from "express";
import { getBillingData, createCheckoutSession, verifyPayment } from "../controllers/billingController.js";

const router = express.Router();

router.get("/", getBillingData);
router.post("/checkout", createCheckoutSession);
router.post("/verify", verifyPayment);

export default router;
