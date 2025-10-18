import { z } from "zod";

export const shoppingCartItemSchema = z.object({
  id: z.string(), // Unique identifier for the cart item
  item: z.object({
    offerId: z.string(),
    productId: z.string(),
    thumbnailUrl: z.string().url(),
    categoryName: z.string(),
    brand: z.string().optional(),
    price: z.number().min(0),
    size: z.string(),
    quantity: z.number().min(1),
    formattedMainColor: z.string(),
    formattedAdditionalColor: z.string().optional(),
  }),
});
