import { z } from "zod";

export const insurerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  rating: z.number().min(0).max(5),
  colorToken: z.string().min(1),
});

export const insurersResponseSchema = z.array(insurerSchema);
