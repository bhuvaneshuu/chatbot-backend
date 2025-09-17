// backend/src/embeddings/ingest.js (ESM)
import "dotenv/config";
import RSSParser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// RSS feed URL
const FEED_URL = process.env.NEWS_RSS_URL || "https://news.google.com/rss";

// Fetch top articles from RSS feed
async function fetchArticles(limit = 50) {
  const parser = new RSSParser();
  const feed = await parser.parseURL(FEED_URL);
  return feed.items.slice(0, limit);
}

// Fetch full article content from the link
async function fetchAndExtract(url) {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(res.data);
    const text = $("body").text();
    return text.replace(/\s+/g, " ").trim();
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return "";
  }
}

// Main ingestion function
async function run() {
  console.log("Fetching articles from RSS feed...");
  const items = await fetchArticles(60); // Fetch 60 articles to get at least 50 valid ones
  const docs = [];

  for (const item of items) {
    const link = item.link || "";
    if (!link) continue;

    console.log(`Fetching article: ${item.title}`);
    const content = await fetchAndExtract(link);
    if (!content) continue;

    const metadata = { title: item.title || "", link };
    docs.push(new Document({ pageContent: content, metadata }));
  }

  console.log(`Fetched ${docs.length} articles. Splitting into chunks...`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  });
  const chunks = await splitter.splitDocuments(docs);

  console.log(`Total chunks created: ${chunks.length}`);

  const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
  const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "news_articles";

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2",
  });

  const store = new Chroma(embeddings, {
    url: CHROMA_URL,
    collectionName: COLLECTION_NAME,
  });

  await store.addDocuments(chunks);

  console.log(`Ingested ${chunks.length} chunks into Chroma`);
}

// Run the ingestion
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
