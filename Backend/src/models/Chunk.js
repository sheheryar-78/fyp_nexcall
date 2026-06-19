import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  documentId: String,
  text: String,
  embedding: [Number],
});

export default mongoose.model("Chunk", chunkSchema);