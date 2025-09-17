import { GoogleGenerativeAI } from "@google/generative-ai";
import { getVectorStore } from "../lib/chromaClient.js";

export async function answerWithRAG({ query }) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, 5);

  // Optional debug logging of retrieved chunks
  if (process.env.DEBUG_CHUNKS === "1" || process.env.DEBUG_CHUNKS === "true") {
    console.log("[RAG] Query:", query);
    console.log("[RAG] Retrieved chunks:");
    results.forEach((d, idx) => {
      const title = d.metadata?.title || "(no title)";
      const link = d.metadata?.link || "(no link)";
      const preview = (d.pageContent || "").slice(0, 200).replace(/\s+/g, " ");
      console.log(`#${idx + 1} Title: ${title}\nURL: ${link}\nPreview: ${preview}\n---`);
    });
  }

  const context = results
    .map((d) => `Title: ${d.metadata?.title}\nURL: ${d.metadata?.link}\nContent: ${d.pageContent}`)
    .join("\n---\n");

  const systemPrompt = `You are a helpful news assistant. Use the provided context from recent news articles to answer the user's question. If the context is insufficient, say you are not sure.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
}
