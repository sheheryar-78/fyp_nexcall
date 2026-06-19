import { useEffect, useState } from "react";

import {
  CreditCard,
  Check,
  Zap,
} from "lucide-react";

import API from "../services/api";

export default function Billing() {

  const [billing, setBilling] = useState(null);

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "per month",
      features: [
        "1,000 minutes/month",
        "Up to 3 AI agents",
        "Basic analytics",
        "Email support",
        "Document upload (3 docs)",
      ],
    },
    {
      name: "Professional",
      price: "$20",
      period: "per month",
      popular: true,
      features: [
        "5,000 minutes/month",
        "Up to 5 AI agents",
        "Advanced analytics",
        "Priority support",
        "Document upload (5 docs)",
        "Custom voice training",
        "API access",
      ],
    },
    {
      name: "Enterprise",
      price: "$50",
      period: "per month",
      features: [
        "Unlimited minutes",
        "Up to 10 AI agents",
        "Full analytics suite",
        "24/7 phone support",
        "Document upload (10 docs)",
        "Custom voice training",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
    },
  ];

  // 🔥 STRIPE VERIFICATION & FETCH
  useEffect(() => {
    fetchBilling();
    
    // Check if user just returned from a successful Stripe payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      const sessionId = urlParams.get("session_id");
      const planName = urlParams.get("plan");
      
      if (sessionId && planName) {
        verifyPayment(sessionId, planName);
      }
    }
  }, []);

  const fetchBilling = async () => {
    const res = await API.get("/billing");
    setBilling(res.data);
  };

  const verifyPayment = async (sessionId, planName) => {
    try {
      const res = await API.post("/billing/verify", { sessionId, planName });
      setBilling(res.data);
      // Clean up URL
      window.history.replaceState(null, "", window.location.pathname);
      alert(`🎉 Payment successful! You are now subscribed to the ${planName} plan.`);
    } catch (err) {
      console.log("Payment Verification Error", err);
      alert("There was an issue verifying your payment.");
    }
  };

  // 🔥 CHECKOUT (REDIRECT TO STRIPE)
  const changePlan = async (plan) => {
    try {
      // Find the price from our frontend list to send to backend
      const selectedPlan = plans.find((p) => p.name === plan);
      const priceAmount = parseInt(selectedPlan.price.replace("$", ""));

      const res = await API.post("/billing/checkout", {
        planName: plan,
        priceAmount: priceAmount
      });
      
      // Redirect to Stripe's secure checkout page
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.log(error);
      alert("Failed to initiate checkout");
    }
  };

  if (!billing) {
    return <div>Loading...</div>;
  }

  const usagePercent =
    (billing.usedMinutes / billing.monthlyMinutes) * 100;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Subscription & Billing
        </h1>

        <p className="text-gray-600 mt-1">
          Manage your plan and payment methods
        </p>
      </div>

      {/* CURRENT PLAN */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <p className="text-blue-100 text-sm font-medium">
              Current Plan
            </p>

            <h2 className="text-3xl font-bold mt-1">
              {billing.currentPlan}
            </h2>

            <p className="text-blue-100 mt-2">
              Active Subscription
            </p>
          </div>

          <div className="text-left md:text-right">

            <p className="text-blue-100 text-sm">
              Usage This Month
            </p>

            <div className="mt-2 space-y-1">

              <p className="text-xl font-bold">
                {billing.usedMinutes} / {billing.monthlyMinutes} minutes
              </p>

              <p className="text-xl font-bold">
                {billing.usedAgents} / {billing.maxAgents} agents
              </p>

            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-4 pt-4 border-t border-blue-400">

          <div className="w-full bg-blue-400 rounded-full h-2">

            <div
              className="bg-white h-2 rounded-full"
              style={{
                width: `${Math.min(usagePercent, 100)}%`,
              }}
            ></div>

          </div>

          <p className="text-xs text-blue-100 mt-2">
            {usagePercent.toFixed(0)}% of monthly minutes used
          </p>

        </div>
      </div>

      {/* PLANS */}
      <div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {plans.map((plan) => {

            const isCurrent =
              billing.currentPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 p-6 relative ${
                  plan.popular
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200"
                }`}
              >

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">

                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">

                      <Zap className="w-3 h-3" />

                      POPULAR

                    </span>

                  </div>
                )}

                <div className="text-center mb-6">

                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>

                  <div className="mt-4">

                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>

                    <span className="text-gray-600 text-sm ml-2">
                      {plan.period}
                    </span>

                  </div>
                </div>

                {/* FEATURES */}
                <ul className="space-y-3 mb-6">

                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2"
                    >

                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />

                      <span className="text-sm text-gray-700">
                        {feature}
                      </span>

                    </li>
                  ))}

                </ul>

                {/* BUTTON */}
                <button
                  onClick={() => changePlan(plan.name)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : "Upgrade"}
                </button>

              </div>
            );
          })}
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-bold text-gray-900">
            Payment Method
          </h2>

        </div>

        <div className="p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">

                <CreditCard className="w-6 h-6 text-white" />

              </div>

              <div>

                <p className="font-medium text-gray-900">
                  •••• •••• •••• {billing.paymentMethod.cardNumber}
                </p>

                <p className="text-sm text-gray-600">
                  Expires {billing.paymentMethod.expiry}
                </p>

              </div>
            </div>

            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              Update
            </button>

          </div>
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-lg font-bold text-gray-900">
            Payment History
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>

              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">

              {billing.paymentHistory.map((payment, index) => (

                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors"
                >

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.date}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.invoice}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">

                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {payment.status}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}