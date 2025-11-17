import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export const getRedisClient = async () => {
  // connection exists
  if (client) {
    return client;
  }
  // new connections
  try {
    client = createClient({
      url: process.env.REDIS_URL!,
    });
    await client.connect();
    console.log("✅ Redis connected");
    return client;
  } catch (e) {
    console.error(e);
    client = null;
    throw new Error("Failed to connect to Redis");
  }
};
