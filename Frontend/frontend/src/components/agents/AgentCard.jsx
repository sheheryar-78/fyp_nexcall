import { Phone, Power } from 'lucide-react';

export default function AgentCard({ agent, onClick }) {
  return (
    <div
      onClick={() => onClick(agent)}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${agent.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
            <Phone className={`w-6 h-6 ${agent.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-500">{agent.phoneNumber}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Power className="w-3 h-3" />
          {agent.status === 'active' ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-gray-600">Document</span>
          <span className="font-medium text-gray-900 truncate max-w-[150px] text-right" title={agent.documents && agent.documents.length > 0 ? agent.documents[0] : 'None'}>
            {agent.documents && agent.documents.length > 0 ? agent.documents[0] : 'None'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-900">{agent.createdAt}</span>
        </div>
      </div>
    </div>
  );
}