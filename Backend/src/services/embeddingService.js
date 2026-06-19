import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

let dynamicModelName = null;

export const createEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

  // 🔹 Dynamically find the supported embedding model
  if (!dynamicModelName) {
    const maskedKey = apiKey.length > 10 
      ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` 
      : "invalid-short-key";
    console.log(`Checking supported models for API key: ${maskedKey} (length: ${apiKey.length})`);
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    
    if (data.error) {
      throw new Error(`API Error (with key ${maskedKey}): ${data.error.message}`);
    }

    const embeddingModel = data.models.find(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("embedContent")
    );

    if (!embeddingModel) {
      throw new Error("❌ Is API key par embeddings blocked hain (shyed aapke region mein free tier embeddings band hain).");
    }

    dynamicModelName = embeddingModel.name.replace("models/", "");
    console.log("Found supported embedding model:", dynamicModelName);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: dynamicModelName });

  const result = await model.embedContent(text);
  
  return result.embedding.values;
};