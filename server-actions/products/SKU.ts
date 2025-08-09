"use server";

import { redis } from "@/upstash/redis";

const SKU_REDIS_SET = "generated_skus";

/**
 * Generates a 4-character unique SKU code in base32 format
 * Base32 uses characters: A-Z and 2-7 (total 32 characters)
 * This gives us 32^4 = 1,048,576 possible combinations
 */
const generateSKU = (): string => {
  // Base32 alphabet (RFC 4648) - excluding 0, 1, 8, 9 to avoid confusion
  const base32Chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  let sku = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * base32Chars.length);
    sku += base32Chars[randomIndex];
  }

  return sku;
};

/**
 * Checks if a SKU exists in Redis
 * @param sku - SKU to check
 * @returns boolean indicating if the SKU already exists
 */
export const isSKUUsed = async (sku: string): Promise<boolean> => {
  try {
    const exists = await redis.sismember(SKU_REDIS_SET, sku);
    return exists === 1;
  } catch (error) {
    console.error("Error checking SKU in Redis:", error);
    // If Redis is unavailable, fallback to false to avoid blocking SKU generation
    return false;
  }
};

/**
 * Adds a SKU to the Redis set of used SKUs
 * @param sku - SKU to add
 */
export const addSKUToUsed = async (sku: string): Promise<void> => {
  try {
    await redis.sadd(SKU_REDIS_SET, sku);
  } catch (error) {
    console.error("Error adding SKU to Redis:", error);
    // Don't throw error to avoid breaking the flow
  }
};

/**
 * Generates a unique SKU that doesn't exist in Redis
 * @param maxAttempts - maximum number of attempts to generate unique SKU (default: 100)
 * @returns unique SKU string
 */
export const generateUniqueSKU = async (
  maxAttempts: number = 100
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const sku = generateSKU();
    const isUsed = await isSKUUsed(sku);

    if (!isUsed) {
      await addSKUToUsed(sku);
      return sku;
    }
  }

  throw new Error(
    `Unable to generate unique SKU after ${maxAttempts} attempts`
  );
};

/**
 * Generates multiple unique SKU codes using Redis for uniqueness checking
 * @param count - number of SKUs to generate
 * @param maxAttempts - maximum attempts per SKU generation (default: 100)
 * @returns array of unique SKU codes
 */
export const generateUniqueSKUs = async (
  count: number,
  maxAttempts: number = 100
): Promise<string[]> => {
  const skus: string[] = [];

  for (let i = 0; i < count; i++) {
    const sku = await generateUniqueSKU(maxAttempts);
    skus.push(sku);
  }

  return skus;
};

/**
 * Adds multiple SKUs to the Redis set (useful for migrating existing SKUs)
 * @param skus - array of SKUs to add
 */
export const addSKUsToUsed = async (skus: string[]): Promise<void> => {
  if (skus.length === 0) return;

  try {
    // Add each SKU individually to avoid TypeScript spread operator issues
    for (const sku of skus) {
      await redis.sadd(SKU_REDIS_SET, sku);
    }
  } catch (error) {
    console.error("Error adding multiple SKUs to Redis:", error);
  }
};

/**
 * Gets the count of used SKUs in Redis
 * @returns number of used SKUs
 */
export const getUsedSKUsCount = async (): Promise<number> => {
  try {
    const count = await redis.scard(SKU_REDIS_SET);
    return count;
  } catch (error) {
    console.error("Error getting SKUs count from Redis:", error);
    return 0;
  }
};

/**
 * Clears all used SKUs from Redis (use with caution)
 */
export const clearAllUsedSKUs = async (): Promise<void> => {
  try {
    await redis.del(SKU_REDIS_SET);
  } catch (error) {
    console.error("Error clearing SKUs from Redis:", error);
  }
};
