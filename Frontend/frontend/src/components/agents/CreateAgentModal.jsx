import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import API from '../../services/api';

export default function CreateAgentModal({ onClose, onCreate }) {
  const [documentsList, setDocumentsList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    documents: [],
  });

  useEffect(() => {
    fetchDocuments();
    fetchTwilioConfig();
  }, []);

  const fetchTwilioConfig = async () => {
    try {
      const res = await API.get('/twilio/config');
      if (res.data.twilioPhoneNumber) {
        setForm(prev => ({ ...prev, phoneNumber: res.data.twilioPhoneNumber }));
      }
    } catch (err) {
      console.log("Error fetching twilio config:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await API.get('/documents');
      // Only show successfully processed documents, or all if you prefer
      setDocumentsList(res.data);
    } catch (err) {
      console.log("Error fetching documents:", err);
    }
  };

  const handleSubmit = () => {
    onCreate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New AI Agent</h2>
            <p className="text-sm text-gray-600 mt-1">Set up a new voice agent</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
            <input
              type="text"
              placeholder="e.g., Customer Support Agent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={form.phoneNumber}
              readOnly
              onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Knowledge Base Document</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setForm({ ...form, documents: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">-- Select a Document --</option>
              {documentsList.map((doc) => (
                <option key={doc._id} value={doc.fileName}>
                  {doc.fileName} {doc.status === 'processing' ? '(Processing...)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}