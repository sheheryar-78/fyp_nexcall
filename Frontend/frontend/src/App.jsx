import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AIAgents from "./pages/AIAgents";
import Documents from "./pages/Documents";
import CallHistory from "./pages/CallHistory";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function App() {
  // ✅ Direct token check (no refresh issue)
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // ✅ Login handler
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // 🔐 Protected Route
  const ProtectedRoute = ({ children }) => {
    if (!localStorage.getItem("token")) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* 🔓 Login Route */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* 🔒 Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/agents"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AIAgents />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Documents />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CallHistory />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Billing />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔁 Default Route */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ❌ Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;