import OpenAI from "openai";
import { createEmbedding } from "../services/embeddingService.js";
import { findRelevantChunks } from "../services/searchService.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async (req, res) => {
  const { question } = req.body;

  const queryEmbedding = await createEmbedding(question);

  const relevantChunks = await findRelevantChunks(queryEmbedding);

  const context = relevantChunks.map(c => c.text).join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI agent. Answer ONLY from provided context. If not found, say 'I don't know'.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  res.json({
    answer: response.choices[0].message.content,
  });
};