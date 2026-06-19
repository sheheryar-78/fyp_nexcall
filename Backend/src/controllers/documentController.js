/* import Document from "../models/Document.js";
import path from "path";

export const getDocuments = async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 });
  res.json(docs);
};

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    const doc = new Document({
      fileName: file.originalname,
      size: (file.size / 1024).toFixed(2) + " KB",
      filePath: req.file.path,
      status: "processing",
    });

    const saved = await doc.save();

    // 🔥 Fake processing (later RAG yahan hoga)
    setTimeout(async () => {
      saved.status = "vectorized";
      await saved.save();
    }, 5000);

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!doc.fileUrl) {
      return res.status(400).json({ message: "File URL missing" });
    }

    // 🔥 FIX HERE
    const filePath = path.resolve(doc.fileUrl);

    res.download(filePath, doc.fileName);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Download error" });
  }
}; */
//-----------//
/* import Document from "../models/Document.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDocuments = async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 });
  res.json(docs);
};

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;

    // 🔹 Save correct file paths
    const filePath = file.path; // multer path
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    const doc = new Document({
      fileName: file.originalname,
      size: (file.size / 1024).toFixed(2) + " KB",
      filePath, 
      fileUrl,
      status: "processing",
    });

    const saved = await doc.save();

    // 🔥 Fake processing
    setTimeout(async () => {
      saved.status = "vectorized";
      await saved.save();
    }, 5000);

    res.json(saved);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // 🔹 Correct path outside src
    let filePath;
    if (doc.filePath) {
      // filePath already includes uploads folder
      filePath = path.resolve(doc.filePath); // C:\Users\Dell\Desktop\FYP\Backend\uploads\...
    } else if (doc.fileUrl) {
      const urlParts = doc.fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      filePath = path.resolve("uploads", fileName); // Backend root uploads folder
    } else {
      return res.status(400).json({ message: "File path missing" });
    }

    // 🔹 Check if file really exists
    if (!fs.existsSync(filePath)) {
      console.log("File not found on server:", filePath);
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, doc.fileName);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Download error" });
  }
}; */


import Document from "../models/Document.js";
import Chunk from "../models/Chunk.js"; // 🔥 NEW
import Billing from "../models/Billing.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// RAG utils
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/chunker.js";
import { createEmbedding } from "../services/embeddingService.js";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= GET =================
export const getDocuments = async (req, res) => {
  const docs = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(docs);
};

// ================= UPLOAD (UPDATED) =================
export const uploadDocument = async (req, res) => {
  try {
    const billing = await Billing.findOne({ userId: req.userId });
    if (billing && billing.usedDocuments >= billing.maxDocuments) {
      return res.status(403).json({ message: "Plan limit reached. Please upgrade to upload more documents." });
    }

    const file = req.file;

    const filePath = file.path;
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    // 🔹 Save document
    const doc = new Document({
      userId: req.userId,
      fileName: file.originalname,
      size: (file.size / 1024).toFixed(2) + " KB",
      filePath,
      fileUrl,
      status: "processing",
    });

    const saved = await doc.save();

    if (billing) {
      billing.usedDocuments += 1;
      await billing.save();
    }

    // REAL RAG PROCESS (background)
    setTimeout(async () => {
      try {
        console.log("Extracting text...");

        const text = await extractTextFromPDF(filePath);

        console.log("Chunking...");
        const chunks = chunkText(text);

        console.log("Creating embeddings...");
        const chunkDocs = [];

        for (let chunk of chunks) {
          const embedding = await createEmbedding(chunk);
          chunkDocs.push({
            documentId: saved._id,
            text: chunk,
            embedding,
          });
        }

        // 🔹 Bulk Insert chunks
        if (chunkDocs.length > 0) {
          await Chunk.insertMany(chunkDocs);
        }

        // 🔹 Update status
        saved.status = "vectorized";
        await saved.save();

        console.log("Document vectorized:", saved.fileName);
      } catch (err) {
        console.log("RAG Error:", err);
        saved.status = "failed";
        await saved.save();
      }
    }, 1000); // delay so response fast aaye

    res.json(saved);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
export const deleteDocument = async (req, res) => {
  const deleted = await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (deleted) {
    const billing = await Billing.findOne({ userId: req.userId });
    if (billing && billing.usedDocuments > 0) {
      billing.usedDocuments -= 1;
      await billing.save();
    }
  }
  res.json({ message: "Deleted" });
};

// ================= DOWNLOAD =================
export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ message: "Document not found or unauthorized" });

    let filePath;

    if (doc.filePath) {
      filePath = path.resolve(doc.filePath);
    } else if (doc.fileUrl) {
      const urlParts = doc.fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      filePath = path.resolve("uploads", fileName);
    } else {
      return res.status(400).json({ message: "File path missing" });
    }

    if (!fs.existsSync(filePath)) {
      console.log("File not found on server:", filePath);
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, doc.fileName);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Download error" });
  }
};