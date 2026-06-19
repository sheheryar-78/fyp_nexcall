import {
  LayoutDashboard,
  Bot,
  FileText,
  Phone,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "agents", label: "AI Agents", icon: Bot, path: "/agents" },
    { id: "documents", label: "Documents", icon: FileText, path: "/documents" },
    { id: "calls", label: "Call History", icon: Phone, path: "/calls" },
    { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🔹 Auto close sidebar on resize (mobile → desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 🔹 Mobile Hamburger */}
      <div
  className={`md:hidden fixed top-4 left-4 z-50 ${
    isOpen ? "hidden" : "block"
  }`}
>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 🔹 Sidebar */}
<div
  className={`fixed top-0 left-0 h-screen min-h-screen w-64 bg-white border-r border-gray-200 flex flex-col
  transform transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 md:flex
  z-40`}
>
        {/* 🔹 Header (Logo + Close btn mobile) */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NexCall</h1>
              <p className="text-xs text-gray-500">AI Voice Platform</p>
            </div>
          </Link>

          {/* Close button (mobile) */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* 🔹 Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 🔹 Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* 🔹 Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}