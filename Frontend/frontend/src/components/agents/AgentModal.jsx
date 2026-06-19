import {
  X,
  Phone,
  Settings,
  PlayCircle,
  FileText,
  Key,
  Edit,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AgentModal({ agent, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(agent);
  const [documentsList, setDocumentsList] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await API.get('/documents');
        setDocumentsList(res.data);
      } catch (err) {
        console.log("Error fetching documents:", err);
      }
    };
    fetchDocuments();
  }, []);

  // ✅ Toggle Status
  const handleToggle = async () => {
    try {
      const updatedStatus = form.status === "active" ? "inactive" : "active";

      const res = await API.put(`/agents/${agent._id}`, {
        ...form,
        status: updatedStatus,
      });

      setForm(res.data);
      onUpdate(res.data);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
      } else {
        console.log("Toggle Error:", err);
      }
    }
  };

  // ✅ Save Edit
  const handleSave = async () => {
    try {
      const res = await API.put(`/agents/${agent._id}`, form);
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.log("Update Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            {isEditing ? (
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="text-xl font-bold border-b outline-none"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">
                {form.name}
              </h2>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Agent Configuration
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Phone */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Phone Number
              </h3>
            </div>

            {isEditing ? (
              <input
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                className="text-2xl font-mono font-bold bg-transparent border-b outline-none"
              />
            ) : (
              <p className="text-2xl font-mono font-bold text-blue-900">
                {form.phoneNumber}
              </p>
            )}
          </div>

          {/* Settings */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Agent Settings
            </h3>

            <div className="space-y-3">

              {/* Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Status</span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === "active"}
                    onChange={handleToggle}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full
                  peer-checked:bg-blue-600
                  after:content-['']
                  after:absolute
                  after:top-[2px]
                  after:left-[2px]
                  after:bg-white
                  after:border
                  after:rounded-full
                  after:h-5
                  after:w-5
                  after:transition-all
                  peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {/* Voice Type section removed as requested */}

              {/* Provider */}
{/*               <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span>Voice Provider</span>

                {isEditing ? (
                  <input
                    value={form.voiceProvider}
                    onChange={(e) =>
                      setForm({ ...form, voiceProvider: e.target.value })
                    }
                    className="border-b outline-none"
                  />
                ) : (
                  <span>{form.voiceProvider}</span>
                )}
              </div> */}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Knowledge Base Document
            </h3>

            <div className="space-y-2">
              {isEditing ? (
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={(form.documents && form.documents.length > 0) ? form.documents[0] : ""}
                  onChange={e => setForm({ ...form, documents: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">-- Select a Document --</option>
                  {documentsList.map((doc) => (
                    <option key={doc._id} value={doc.fileName}>
                      {doc.fileName} {doc.status === 'processing' ? '(Processing...)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                (form.documents || []).length > 0 ? (
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <span>{form.documents[0]}</span>
                    <span className="text-green-600 text-xs font-semibold">Linked</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No document linked</p>
                )
              )}
            </div>
          </div>

          {/* API Key */}
{/*           <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key className="w-5 h-5" /> API Configuration
            </h3>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-mono text-sm bg-white p-3 rounded border">
                {form.apiKey || "sk_live_xxxxx"}
              </div>
            </div>
          </div> */}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">

            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                <Edit className="inline w-4 mr-1" />
                Edit Agent
              </button>
            )}

            <button
              onClick={() => onDelete(agent._id)}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-lg"
            >
              <Trash2 className="w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}