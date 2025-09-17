import { Router } from "express";
import { getRedis } from "../lib/redisClient.js";
import { answerWithRAG } from "../services/rag.js";

const router = Router();

router.post("/ask", async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    const redis = getRedis();
    const historyKey = `history:${sessionId}`;

    const responseText = await answerWithRAG({ query: message, sessionId });

    const entry = JSON.stringify({ role: "user", content: message, ts: Date.now() });
    const reply = JSON.stringify({ role: "assistant", content: responseText, ts: Date.now() });
    await redis.rpush(historyKey, entry, reply);

    const ttlSeconds = Number(process.env.REDIS_TTL_SECONDS || 60 * 60 * 6);
    await redis.expire(historyKey, ttlSeconds);

    res.json({ answer: responseText });
  } catch (err) {
    console.error("/chat/ask error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
