import { z } from "zod";

export const brandSchema = z.object({
  id: z.string().optional(), // for update
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export type BrandValues = z.infer<typeof brandSchema>;

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export const quickCreateNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type QuickCreateName = z.infer<typeof quickCreateNameSchema>;
