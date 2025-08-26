import { z } from "zod";

export const shoppingCartItemSchema = z.object({
  id: z.string(),
  offer: z.object({
    id: z.string(),
    thumbnailUrl: z.string().url(),
    categoryName: z.string(),
    brand: z.string().optional(),
    price: z.number().min(0),
    size: z.string(),
    quantity: z.number().min(1),
  }),
});

export const shoppingCartSchema = z.object({
  items: z.array(shoppingCartItemSchema),
});
