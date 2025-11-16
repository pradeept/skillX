import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export const getRedisClient = async () => {
  if (!client) {
    try {
      client = createClient({
        url: process.env.REDIS_URL as string,
      });
      console.log("✅ Redis connected");
      return await client.connect();
    } catch (e) {
      console.error(e);
      throw new Error("❌ Failed to connect to Redis");
    }
  } else {
    return client;
  }
};
