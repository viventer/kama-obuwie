import { z } from "zod";

export const ImageUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(new URL(url).pathname),
    {
      message: "URL nie wskazuje na obsługiwany plik graficzny",
    }
  );

export type ImageUrl = z.infer<typeof ImageUrlSchema>;

export const SalesChannelSchema = z.enum(["AL1", "AL2", "POS", "DTC"]);
