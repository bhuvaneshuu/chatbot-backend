import "dotenv/config";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "news_articles";

export async function getVectorStore() {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
  });

  // Use fromExistingCollection if you are sure it exists
  const store = await Chroma.fromExistingCollection(embeddings, {
    url: CHROMA_URL,
    collectionName: COLLECTION_NAME,
  });

  return store;
}

export async function getOrCreateVectorStore() {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
  });

  // First, attempt to create or connect
  const store = await Chroma.fromExistingCollection(embeddings, {
    url: CHROMA_URL,
    collectionName: COLLECTION_NAME,
  }).catch(async () => {
    // If collection doesn’t exist, create it
    return new Chroma(embeddings, {
      url: CHROMA_URL,
      collectionName: COLLECTION_NAME,
    });
  });

  return store;
}

