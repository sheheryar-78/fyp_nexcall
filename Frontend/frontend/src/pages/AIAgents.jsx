import { useEffect, useState } from "react";
import API from "../services/api";

import AgentHeader from "../components/agents/AgentHeader";
import AgentCard from "../components/agents/AgentCard";
import AgentModal from "../components/agents/AgentModal";
import CreateAgentModal from "../components/agents/CreateAgentModal";

export default function AIAgents() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🔥 FETCH AGENTS
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await API.get("/agents");
      setAgents(res.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };

  // 🔥 CREATE
 /*  const handleCreateAgent = async (data) => {
    try {
      const res = await API.post("/agents", data);
      setAgents((prev) => [res.data, ...prev]);
    } catch (err) {
      console.log("Create Error:", err);
    }
  }; */


  const handleCreateAgent = async (data) => {
    try {
      const res = await API.post("/agents", data);
      setAgents([res.data, ...agents]);
      return res.data; // 🔥 VERY IMPORTANT
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data.message);
      } else {
        console.log(err);
        alert("Failed to create agent.");
      }
    }
  };
  // 🔥 DELETE
  const handleDeleteAgent = async (id) => {
    try {
      await API.delete(`/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a._id !== id));
      setSelectedAgent(null);
    } catch (err) {
      console.log("Delete Error:", err);
    }
  };

  // 🔥 UPDATE (VERY IMPORTANT)
  const handleUpdateAgent = (updatedAgent) => {
    setAgents((prev) =>
      prev.map((a) => (a._id === updatedAgent._id ? updatedAgent : a))
    );
    setSelectedAgent(updatedAgent); // modal update
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <AgentHeader onCreate={() => setShowCreateModal(true)} />

      {/* 🔹 Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.length === 0 ? (
          <div className="text-gray-500 text-sm">No agents found</div>
        ) : (
          agents.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              onClick={setSelectedAgent}
            />
          ))
        )}
      </div>

      {/* 🔹 Modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onDelete={handleDeleteAgent}
          onUpdate={handleUpdateAgent} // ✅ FIX
        />
      )}

      {/* 🔹 Create Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAgent}
        />
      )}
    </div>
  );
}