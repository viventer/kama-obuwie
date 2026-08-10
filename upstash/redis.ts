import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

if (!url || !token) {
  throw new Error(
    "Missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN environment variables",
  );
}

export const redis = new Redis({ url, token });
