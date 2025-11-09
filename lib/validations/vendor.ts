import { z } from "zod";

export const vendorSetupSchema = z.object({
  shopName: z.string().min(3, "Shop name must be at least 3 characters"),
  shopSlug: z
    .string()
    .trim()
    .min(1, "Shop slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens"
    ),
  shopDescription: z.string().optional().nullable(),

  businessType: z.string().optional().nullable(),
  businessRegistration: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),

  businessEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  businessPhone: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),

  // Optional branding fields (keep strings, you can wire upload later)
  shopLogo: z.string().optional().nullable(),
  shopBanner: z.string().optional().nullable(),
});

export type VendorSetupValues = z.infer<typeof vendorSetupSchema>;
