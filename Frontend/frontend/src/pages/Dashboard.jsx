import {
  Phone,
  Bot,
  ThumbsUp,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [chartData, setChartData] = useState([]); // 🔥 NEW
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "N/A" 
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  // 🔥 Fetch all data
  useEffect(() => {
    fetchDashboard();

    // 🔥 Real-time refresh (5 sec) for EVERYTHING (Stats, Calls, Chart)
    const interval = setInterval(() => {
      fetchDashboard(false); // pass false so we don't show loading screen again
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async (isInitialLoad = true) => {
    try {
      const statsRes = await API.get("/dashboard/stats");
      const callsRes = await API.get("/calls");

      setStats(statsRes.data);
      setCalls(callsRes.data);

      await fetchAnalytics(); // 🔥 also load chart
    } catch (err) {
      console.log("Dashboard ERROR:", err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics/weekly-calls");
      setChartData(res.data);
    } catch (err) {
      console.log("Analytics ERROR:", err);
    }
  };

  // ⏳ Loading
  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-6 text-red-500">Failed to load dashboard</div>;
  }

  const statCards = [
    {
      label: "Total Calls Today",
      value: stats.totalCalls || 0,
      icon: Phone,
      change: "+12%",
      positive: true,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active AI Agents",
      value: stats.activeAgents || 0,
      icon: Bot,
      change: "+2",
      positive: true,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Customer Satisfaction",
      value: stats.satisfaction || 0,
      icon: ThumbsUp,
      change: "+0.3",
      positive: true,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Avg Call Duration",
      value: stats.avgDuration || "0s",
      icon: Clock,
      change: "-5%",
      positive: false,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const maxCalls = Math.max(...chartData.map((d) => d.calls), 1);

  return (
    <div className="space-y-6">

      {/* 🔹 Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      {/* 🔹 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>

                  <div className="flex items-center gap-1 mt-2">
                    {stat.positive ? (
                      <ArrowUp className="w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>

                <div className={`${stat.bgColor} ${stat.iconColor} w-10 h-10 flex items-center justify-center rounded-lg`}>
  <Icon className="w-5 h-5" />
</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 🔥 Call Analytics */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Call Analytics</h2>
            <p className="text-sm text-gray-600">Daily call volume (Last 7 Days)</p>
          </div>

          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Live</span>
          </div>
        </div>

        <div className="relative h-72 mt-8 flex">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between items-end pr-4 text-xs font-medium text-gray-400 h-[200px]">
            <span>{maxCalls}</span>
            <span>{Math.ceil(maxCalls * 0.75)}</span>
            <span>{Math.ceil(maxCalls * 0.5)}</span>
            <span>{Math.ceil(maxCalls * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart Area */}
          <div className="relative flex-1 flex items-end justify-between h-[200px] border-l border-b border-gray-200 pb-0">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-gray-100 border-dashed"></div>
              <div className="w-full border-t border-gray-100 border-dashed"></div>
              <div className="w-full border-t border-gray-100 border-dashed"></div>
              <div className="w-full border-t border-gray-100 border-dashed"></div>
              <div className="w-full border-t border-transparent"></div> {/* Bottom aligned with X axis */}
            </div>

            {/* Bars */}
            {chartData.map((data, index) => {
              const height = (data.calls / maxCalls) * 100;

              return (
                <div key={index} className="relative flex flex-col items-center flex-1 z-10 group h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-gray-800 text-white text-xs font-bold px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {data.calls} calls
                  </div>

                  {/* Bar */}
                  <div
                    className="w-8 sm:w-12 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300 cursor-pointer"
                    style={{
                      height: `${Math.max(height, 5)}%`, // At least 5% height to be visible
                    }}
                  ></div>

                  {/* X-Axis Label */}
                  <span className="absolute -bottom-7 text-xs font-medium text-gray-500">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔹 Recent Calls */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b">
          <h2 className="font-bold">Recent Calls</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                {["Caller", "Agent", "Duration", "Status", "Time"].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No calls found
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call._id} className="border-t">
                    <td className="px-4 py-3">{call.caller}</td>
                    <td className="px-4 py-3">{call.agent}</td>
                    <td className="px-4 py-3">{call.duration}</td>
                    <td className="px-4 py-3">{call.status}</td>
                    <td className="px-4 py-3">
                      {formatDate(call.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}