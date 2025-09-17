import Redis from "ioredis";

let client = null;

export function getRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  client = new Redis(url);
  return client;
}
