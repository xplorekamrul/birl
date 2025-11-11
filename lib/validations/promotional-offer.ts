import { z } from "zod";

export const promoCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url().or(z.string().min(1)), // allow CDN path too
  buttonText: z.string().min(1),
  link: z.string().min(1),
  backgroundColor: z.string().min(1),
  textColor: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean().default(true),
  priority: z.coerce.number().int().min(0).default(0),
});

export const promoUpdateSchema = promoCreateSchema.extend({
  id: z.string().min(1),
});

export type PromoCreateInput = z.infer<typeof promoCreateSchema>;
export type PromoUpdateInput = z.infer<typeof promoUpdateSchema>;
