import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  Check,
  Clock,
  Trash2,
  Download,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  // 🔥 FETCH
  useEffect(() => {
    fetchDocs();
  }, []);

  // 🔥 POLL STATUS
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "processing");
    let intervalId;

    if (hasProcessing) {
      intervalId = setInterval(() => {
        fetchDocs();
      }, 3000); // poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [documents]);

  const fetchDocs = async () => {
    try {
      const res = await API.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 FILE SELECT
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🔥 UPLOAD
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first ❗");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 🔥 refresh list
      setDocuments([res.data, ...documents]);
      setFile(null);

      alert("Uploaded successfully ✅");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data.message);
      } else {
        console.log(err);
        alert("Upload failed.");
      }
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(documents.filter((d) => d._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

const handleDownload = async (id, fileName) => {
  try {
    // 🔹 backend pe ab download route: /api/documents/download/:id
    const res = await API.get(`/documents/download/${id}`, {
      responseType: "blob", // important for files
    });

    // 🔹 Create blob URL
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "document"); // fallback name
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.log(err);
    alert(
      err.response?.data?.message ||
        "Download failed! Please try again."
    );
  }
};

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage knowledge base documents
        </p>
      </div>

      {/* UPLOAD UI */}
      <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Documents
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>

          <input
            type="file"
            className="hidden"
            id="fileUpload"
            onChange={handleFileChange}
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Files
          </label>

          {file && (
            <button
              onClick={handleUpload}
              className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload
            </button>
          )}

          {file && (
            <p className="text-sm text-gray-600 mt-3">
              Selected: {file.name}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Supported formats: PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Uploaded Documents
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {doc.fileName}
                    </h3>

                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {doc.size}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Uploaded{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS + ACTIONS */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                      doc.status === "vectorized"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {doc.status === "vectorized" ? (
                      <>
                        <Check className="w-3 h-3" />
                        Vectorized
                      </>
                    ) : doc.status === "failed" ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Processing
                      </>
                    )}
                  </div>

                  <button
  onClick={() => handleDownload(doc._id, doc.fileName)}
  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
>
  <Download className="w-5 h-5" />
</button>

                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PROGRESS */}
              {doc.status === "processing" && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full animate-pulse w-2/3"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Processing document and generating embeddings...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          How Document Processing Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Documents are vectorized for AI retrieval</li>
          <li>• Agents use them during calls</li>
          <li>• Takes ~1-3 minutes</li>
        </ul>
      </div>
    </div>
  );
}