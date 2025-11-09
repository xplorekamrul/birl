import { z } from "zod";

export const brandSchema = z.object({
  id: z.string().optional(), // for update
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
});

export type BrandValues = z.infer<typeof brandSchema>;

export const categorySchema = z.object({
  id: z.string().optional(), 
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  parentId: z.string().optional().nullable(),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export const quickCreateNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type QuickCreateName = z.infer<typeof quickCreateNameSchema>;
