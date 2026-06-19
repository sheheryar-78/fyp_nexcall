import { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Mail, 
  Lock, 
  AlertTriangle,
  Camera,
  Trash2,
  Save
} from "lucide-react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    emailSummary: true,
    limitAlerts: true,
    newFeatures: false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setProfile({ name: res.data.name, email: res.data.email });
      if (res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.log("Error fetching profile", err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await API.put("/users/profile", { name: profile.name, email: profile.email });
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await API.put("/users/profile", { notifications });
      alert("Preferences saved successfully!");
    } catch (err) {
      alert("Failed to save preferences.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return alert("Please fill both password fields.");
    }
    try {
      await API.put("/users/password", passwords);
      alert("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to PERMANENTLY delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await API.delete("/users/account");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Manage your account preferences and notifications.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 space-y-8">
          
          {/* ================= PROFILE SETTINGS ================= */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold uppercase">
                        {profile.name ? profile.name.charAt(0) : "?"}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
                  
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleUpdatePassword}
                      className="mt-4 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h2>
                    <p className="text-sm text-red-600 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= NOTIFICATIONS ================= */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>
                
                <div className="space-y-6">
                  {/* Toggle Item */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Daily Call Summary</h3>
                      <p className="text-sm text-gray-500 mt-1">Receive a daily email containing the summary and sentiment analysis of all your calls.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.emailSummary}
                        onChange={() => setNotifications({...notifications, emailSummary: !notifications.emailSummary})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <hr className="border-gray-100" />

                  {/* Toggle Item */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Usage Limit Alerts</h3>
                      <p className="text-sm text-gray-500 mt-1">Get notified when you reach 80% and 100% of your plan's monthly limits.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.limitAlerts}
                        onChange={() => setNotifications({...notifications, limitAlerts: !notifications.limitAlerts})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Toggle Item */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">News & Features</h3>
                      <p className="text-sm text-gray-500 mt-1">Hear about new features, AI models, and updates to the NexCall platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.newFeatures}
                        onChange={() => setNotifications({...notifications, newFeatures: !notifications.newFeatures})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleSaveNotifications}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
