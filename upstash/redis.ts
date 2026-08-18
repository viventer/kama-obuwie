import { AsyncLocalStorage } from "node:async_hooks";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

if (!url || !token) {
  throw new Error(
    "Missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN environment variables",
  );
}

const redisCommandCounts = new AsyncLocalStorage<Map<string, number>>();

const COMMAND_LOG_ENABLED = true;

const SKIP_PROXY_KEYS = new Set([
  "then",
  "catch",
  "finally",
  "constructor",
  "toJSON",
]);

function wrapWithCommandLog(client: Redis): Redis {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof prop !== "string" || typeof value !== "function") {
        return value;
      }
      if (SKIP_PROXY_KEYS.has(prop) || prop.startsWith("_")) {
        return value;
      }

      return (...args: unknown[]) => {
        const counts = redisCommandCounts.getStore();
        if (counts) {
          counts.set(prop, (counts.get(prop) ?? 0) + 1);
        }
        return value.apply(target, args);
      };
    },
  });
}

const redisClient = new Redis({ url, token });

export const redis = COMMAND_LOG_ENABLED
  ? wrapWithCommandLog(redisClient)
  : redisClient;

export async function withRedisCommandLog<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!COMMAND_LOG_ENABLED) {
    return fn();
  }

  return redisCommandCounts.run(new Map(), async () => {
    const startedAt = Date.now();
    try {
      return await fn();
    } finally {
      const counts = redisCommandCounts.getStore() ?? new Map();
      const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
      console.log(
        `[redis-commands] ${label} total=${total} elapsedMs=${Date.now() - startedAt} counts=${JSON.stringify(Object.fromEntries(counts))}`,
      );
    }
  });
}
