import { Router } from "express";
import { getRedis } from "../lib/redisClient.js";

const router = Router();

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const redis = getRedis();
    const historyKey = `history:${sessionId}`;
    const items = await redis.lrange(historyKey, 0, -1);
    const messages = items.map((i) => JSON.parse(i));
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const redis = getRedis();
    const historyKey = `history:${sessionId}`;
    await redis.del(historyKey);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
