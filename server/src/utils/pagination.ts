import { getRedisClient } from "../configs/redis/redis.ts";
import { getProfilesCount } from "../domains/search/search.service.ts";

export const calculateOffset = (page: number, limit: number) => {
  return page - 1 * limit;
};

export const getTotalPageCount = async (limit: number) => {
  const redisClient = await getRedisClient();
  let totalUserRecords: string | number | null =
    await redisClient.get("total_user_records");

  if (!totalUserRecords) {
    totalUserRecords = await getProfilesCount();
    await redisClient.set("total_user_records", totalUserRecords?.toString());
  }

  if (typeof totalUserRecords === "string") {
    totalUserRecords = parseInt(totalUserRecords);
  }

  const totalPages = Math.ceil(totalUserRecords / limit);
  return totalPages;
};
