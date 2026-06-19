import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  downloadDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.get("/", getDocuments);


router.post("/upload", upload.single("file"), uploadDocument);

router.delete("/:id", deleteDocument);

router.get("/download/:id", downloadDocument);

export default router;