import { extractTextFromPDF } from "./src/utils/pdfParser.js";
import { chunkText } from "./src/utils/chunker.js";
import { createEmbedding } from "./src/services/embeddingService.js";

async function test() {
  try {
    console.log("Testing embedding...");
    const embedding = await createEmbedding("Hello world");
    console.log("Embedding success, length:", embedding.length);
  } catch (err) {
    console.error("Embedding Error:", err.message);
  }
}

test();
