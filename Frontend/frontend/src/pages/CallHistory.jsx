import { useEffect, useState } from "react";
import { Filter, FileText, X, Star, Phone, Bot, Clock, MessageSquare, ChevronDown } from "lucide-react";
import API from "../services/api";

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ sentiment: "" });

  // ✅ FETCH
  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await API.get("/calls");
      setCalls(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ FILTER
  const filteredCalls = calls.filter((call) => {
    if (filters.sentiment && call.sentiment !== filters.sentiment) {
      return false;
    }
    return true;
  });

  // ✅ RATE
  const handleRate = async (id, rating) => {
    try {
      const res = await API.put(`/calls/${id}/rate`, { rating });
      setCalls(calls.map((call) => (call._id === id ? res.data : call)));
      setSelectedCall(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 shadow-sm border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Positive</span>;
      case "negative":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 shadow-sm border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Negative</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Neutral</span>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Call History</h1>
          <p className="text-gray-500 mt-1">Review your AI agents' recent interactions.</p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
            showFilters ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } border`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* FILTERS */}
      <div className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sentiment Filter</label>
              <select
                value={filters.sentiment}
                onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
              >
                <option value="">All Interactions</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESPONSIVE CALLS LIST / TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Caller</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sentiment</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No calls found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call._id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedCall(call)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Phone className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{call.caller}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Bot className="w-4 h-4 text-gray-400" />
                        {call.agent}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(call.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {call.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getSentimentBadge(call.sentiment)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCall(call); }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No calls found.</div>
          ) : (
            filteredCalls.map((call) => (
              <div key={call._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedCall(call)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{call.caller}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Bot className="w-3 h-3" /> {call.agent}
                      </p>
                    </div>
                  </div>
                  {getSentimentBadge(call.sentiment)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {call.duration}</span>
                  <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PREMIUM MODAL */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl ring-1 ring-black/5 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCall.caller}</h2>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <Bot className="w-4 h-4 text-gray-400" /> Handled by {selectedCall.agent}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {/* Summary Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Call Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {selectedCall.summary || "No summary generated for this interaction."}
                </p>
              </div>

              {/* Transcript */}
              <div className="space-y-4">
                {(!selectedCall.transcript || selectedCall.transcript.length === 0) ? (
                  <div className="text-center py-8 text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
                    Transcript not available for this call.
                  </div>
                ) : (
                  selectedCall.transcript.map((msg, index) => (
                    <div key={index} className={`flex ${msg.speaker === "customer" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${msg.speaker === "customer" ? "items-start" : "items-end"}`}>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                          {msg.speaker === "customer" ? "Customer" : "AI Agent"} • {msg.timestamp}
                        </span>
                        <div
                          className={`px-4 py-3 text-sm rounded-2xl shadow-sm ${
                            msg.speaker === "customer"
                              ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                              : "bg-blue-600 text-white rounded-tr-sm"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer / Rating */}
            <div className="px-6 py-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center sm:text-left">
                  Rate Interaction
                </p>
                <div className="flex gap-1.5 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRate(selectedCall._id, rating)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          rating <= (selectedCall.rating || 0)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-gray-200 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-xl font-black text-gray-900 font-mono tracking-tight">
                  {selectedCall.duration}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}