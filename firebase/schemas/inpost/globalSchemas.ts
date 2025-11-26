import { z } from "zod";

export const InpostErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  error: z.enum([
    "resource_not_found",
    "access_forbidden",
    "invalid_parameter",
    "validation_failed",
    "offer_expired",
    "no_carriers",
    "carrier_unavailable",
    "label_generation_failed",
    "label_template_not_found",
    "invalid_action",
  ]),
  description: z.string().optional().nullable(),
  details: z
    .record(
      z.string(),
      z.array(
        z.enum([
          "invalid",
          "required",
          "too_short",
          "too_long",
          "not_a_number",
          "not_an_integer",
        ])
      )
    )
    .optional()
    .nullable(),
});

export type InpostErrorResponse = z.infer<typeof InpostErrorResponseSchema>;
