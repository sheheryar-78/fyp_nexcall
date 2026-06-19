import { Plus } from 'lucide-react';

export default function AgentHeader({ onCreate }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        <p className="text-gray-600 mt-1">Manage your AI voice agents</p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Create New Agent
      </button>
    </div>
  );
}