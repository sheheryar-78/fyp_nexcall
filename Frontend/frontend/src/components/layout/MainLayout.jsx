import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to page names
  const pathToPage = {
    "/dashboard": "dashboard",
    "/agents": "agents",
    "/documents": "documents",
    "/calls": "calls",
    "/billing": "billing",
    "/settings": "settings",
  };

  const currentPage = pathToPage[location.pathname] || "dashboard";

  // Handle sidebar navigation
  const handleNavigate = (page) => {
    const routes = {
      dashboard: "/dashboard",
      agents: "/agents",
      documents: "/documents",
      calls: "/calls",
      billing: "/billing",
      settings: "/settings",
    };

    navigate(routes[page]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Right Side Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header />

        {/* Main */}
        <main className="mt-16 md:ml-64 p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}