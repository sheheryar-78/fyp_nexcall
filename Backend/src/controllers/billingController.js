import Billing from "../models/Billing.js";

// GET /api/billing
export const getBillingData = async (req, res) => {
  try {
    let billing = await Billing.findOne({ userId: req.userId });

    // If user has no billing record yet, create a default one
    if (!billing) {
      billing = new Billing({ userId: req.userId });
      await billing.save();
    }

    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// POST /api/billing/checkout
export const createCheckoutSession = async (req, res) => {
  try {
    const { planName, priceAmount } = req.body;
    
    // For FYP demonstration without real keys, we can bypass Stripe if key is dummy
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("No Stripe Key found. Using mock checkout URL.");
      // Just redirect straight to success for FYP demo
      return res.json({ 
        url: `http://localhost:5173/billing?success=true&session_id=mock_session_123&plan=${planName}` 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `NexCall ${planName} Plan` },
            unit_amount: priceAmount * 100, // Stripe expects cents
            recurring: { interval: "month" }
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/billing?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planName}`,
      cancel_url: `http://localhost:5173/billing?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Stripe error", error: error.message });
  }
};

// POST /api/billing/verify
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, planName } = req.body;

    let maxAgents = 3;
    let maxDocuments = 3;
    let monthlyMinutes = 1000;
    let amount = "$0.00";

    if (planName === "Professional") {
      maxAgents = 5;
      maxDocuments = 5;
      monthlyMinutes = 5000;
      amount = "$20.00";
    } else if (planName === "Enterprise") {
      maxAgents = 10;
      maxDocuments = 10;
      monthlyMinutes = 99999;
      amount = "$50.00";
    }

    // Add a new mock payment history entry
    const newPayment = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      invoice: `INV-${Math.floor(Math.random() * 100000)}`,
      amount: amount,
      status: "Paid",
    };

    const updatedBilling = await Billing.findOneAndUpdate(
      { userId: req.userId },
      { 
        currentPlan: planName, 
        maxAgents, 
        maxDocuments,
        monthlyMinutes,
        $push: { paymentHistory: newPayment }
      },
      { new: true }
    );

    res.json(updatedBilling);
  } catch (error) {
    res.status(500).json({ message: "Verification error", error: error.message });
  }
};
