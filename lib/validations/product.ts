import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(),

  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Base price must be a non-negative number"),
  salePrice: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v))
    .refine(
      (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
      "Sale price must be a non-negative number"
    ),
  cost: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v))
    .refine(
      (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
      "Cost must be a non-negative number"
    ),

  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  lowStockThreshold: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? "10" : v))
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Low stock threshold must be a non-negative number"
    ),

  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),

  // SEO
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),

  // Flags from model
  allowRefurbished: z.boolean().optional().default(false),
  allowRent: z.boolean().optional().default(false),
  allowHirePurchase: z.boolean().optional().default(false),
  allowPreOrder: z.boolean().optional().default(false),

  // Status / visibility
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]).default("PUBLIC"),
});

export type ProductCreateValues = z.infer<typeof productCreateSchema>;
