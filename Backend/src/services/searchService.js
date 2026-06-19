import Chunk from "../models/Chunk.js";

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB);
};

import Document from "../models/Document.js";

export const findRelevantChunks = async (queryEmbedding, agent) => {
  let query = {};

  if (agent && agent.userId) {
    // Find documents belonging to this user
    let docQuery = { userId: agent.userId };
    
    // If agent has linked documents (by fileName), filter by them
    if (agent.documents && agent.documents.length > 0) {
      docQuery.fileName = { $in: agent.documents };
    }

    const docs = await Document.find(docQuery);
    const docIds = docs.map(d => d._id);
    
    // Only search chunks from these documents
    if (docIds.length > 0) {
      query.documentId = { $in: docIds };
    }
  }

  const chunks = await Chunk.find(query);

  const scored = chunks.map((c) => ({
    text: c.text,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  // 🔥 NEW: Filter out irrelevant chunks (Similarity Threshold)
  // Only keep chunks with a decent semantic match to prevent out-of-domain answers
  const relevant = scored.filter(c => c.score >= 0.60); // Slightly lowered threshold to be safe

  return relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

// NEW: Connect context to Groq for Conversational Response (Faster & Avoids 404)
import { createEmbedding } from "./embeddingService.js";
import Groq from "groq-sdk";

export const generateRAGResponse = async (userQuery, agent) => {
  try {
    // 1. Convert query to vector
    const queryEmbedding = await createEmbedding(userQuery);
    
    // 2. Find closest document chunks
    const relevantChunks = await findRelevantChunks(queryEmbedding, agent);
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");

    // 3. Prompt Groq (Llama 3)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?.trim() });

    const agentName = agent ? agent.name : "our business";

    // 🔥 NEW: System Prompt Guardrails & Graceful Redirection
    const prompt = `You are a professional AI Voice Assistant for ${agentName}.
You MUST ONLY answer questions using the provided context.
Keep your answers very short (1-2 sentences) and conversational, as they will be spoken over a phone call.

STRICT RULE: If the user asks something completely irrelevant or outside the scope of the context (e.g. general knowledge, coding, recipes, etc.), DO NOT try to answer it. 
Instead, politely decline and gracefully redirect them back to your business context.
Example redirection: "I am sorry, but I can only assist you with questions related to our business services. Is there anything about our features or pricing I can help you with?"

CONTEXT:
${context ? context : "[NO RELEVANT CONTEXT FOUND. DECLINE THE QUESTION.]"}

USER QUERY:
${userQuery}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("RAG Response Error:", error);
    return "Sorry, I am having trouble fetching the information right now.";
  }
};