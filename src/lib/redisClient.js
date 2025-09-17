import Redis from "ioredis";

let client = null;

export function getRedis() {
  if (client) return client;

  client = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined, // only if you set a password in Docker/Redis config
  });

  client.on("connect", () => {
    console.log("✅ Connected to Redis");
  });

  client.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });

  return client;
}