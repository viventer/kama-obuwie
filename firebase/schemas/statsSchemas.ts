import { z } from "zod";

export const SalesDailyChannelSchema = z.object({
  revenue: z.number().int(), // grosze
  cogs: z.number().int(), // grosze
  orders: z.number().int(),
  cogsEstimatedOrders: z.number().int().optional(),
});

export const SalesDailySchema = z.object({
  date: z.string(), // "2026-09-29"
  DTC: SalesDailyChannelSchema.optional(),
  AL1: SalesDailyChannelSchema.optional(),
  AL2: SalesDailyChannelSchema.optional(),
  updatedAt: z.string(),
});

export type SalesDailyChannel = z.infer<typeof SalesDailyChannelSchema>;
export type SalesDaily = z.infer<typeof SalesDailySchema>;
