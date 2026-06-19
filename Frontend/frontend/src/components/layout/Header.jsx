import { Bell, Search, User, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({ onMenuClick }) {
  const [user, setUser] = useState({
    name: "User",
    email: "user@email.com",
  });

  // ✅ Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-10">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* 🔹 Left Section */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 🔹 Right Section */}
        <div className="flex items-center gap-3 sm:gap-4 ml-4">
          
          {/* Notification */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-gray-200">
            
            {/* Hide text on small screens */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>

            {/* Avatar (no logout now) */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}