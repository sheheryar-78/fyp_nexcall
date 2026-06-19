import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import API from "../services/api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Login / Signup submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(formData.name)) {
          setError("Name should only contain alphabets and spaces.");
          return;
        }
        
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          setError("Password must be at least 8 characters long and contain at least one special character.");
          return;
        }

        await API.post("/auth/signup", formData);
        alert("Account created! Please login.");
        setIsSignup(false);
      } else {
        const res = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin();
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  // Forgot password click → show new password input
  const handleForgotPassword = () => {
    if (!formData.email) {
      alert("Please enter your email first!");
      return;
    }
    setIsResetting(true);
    setResetSuccess("");
  };

  // Reset password submit
  const handleResetPassword = async () => {
    try {
      const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        alert("Password must be at least 8 characters long and contain at least one special character.");
        return;
      }

      const res = await API.post("/auth/reset-password", {
        email: formData.email,
        newPassword,
      });
      setResetSuccess(res.data.message);
      setIsResetting(false);
      setNewPassword("");
    } catch (err) {
      console.log("Reset Password ERROR:", err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Left panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">NexCall</h1>
            <p className="text-gray-600 mt-2">AI Voice Agent Platform</p>
          </div>

          {/* Form container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isSignup ? "Create your account" : isResetting ? "Reset Password" : "Welcome back"}
              </h2>
              <p className="text-gray-600 mt-1">
                {isSignup
                  ? "Start building AI voice agents today"
                  : isResetting
                  ? "Enter a new password"
                  : "Sign in to your account to continue"}
              </p>
            </div>

            {/* Show error */}
            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
            {resetSuccess && <p className="text-green-600 text-sm mb-3 text-center">{resetSuccess}</p>}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Signup: Name */}
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="John Smith"
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password (login/signup) */}
              {!isResetting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 w-6 h-6 text-gray-400"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password link */}
              {!isSignup && !isResetting && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Reset password input */}
              {isResetting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Reset Password
                  </button>
                </div>
              )}

              {/* Login / Signup submit */}
              {!isResetting && (
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Toggle login/signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setIsResetting(false);
                    setResetSuccess("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right panel for large screens */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10 max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">Transform Customer Service with AI Voice Agents</h2>
          <p className="text-xl text-blue-100 mb-8">
            Create intelligent voice agents that handle customer calls 24/7 using cutting-edge AI technology.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Natural Conversations</h3>
                <p className="text-blue-100 text-sm">Powered by OpenAI GPT for human-like interactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Realistic Voices</h3>
                <p className="text-blue-100 text-sm">Premium voice synthesis from ElevenLabs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Integration</h3>
                <p className="text-blue-100 text-sm">Connect with Twilio in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}