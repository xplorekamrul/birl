import { z } from "zod";

export const businessAddressSchema = z.object({
   street: z.string().optional(),
   city: z.string().optional(),
   state: z.string().optional(),
   postalCode: z.string().optional(),
   country: z.string().optional(),
});

export const businessContactSchema = z.object({
   label: z.string().optional(),
   value: z.string().min(1, "Value is required"),
   isPrimary: z.boolean(),
});

export const businessInfoSchema = z.object({
   id: z.string().optional(),
   name: z.string().min(2, "Name must be at least 2 characters"),
   logoSrc: z.string().min(1, "Logo URL is required"), // Assuming URL string input
   logoAlt: z.string().optional(),
   bannerSrc: z.string().optional(),
   bannerAlt: z.string().optional(),
   businessHours: z.string().optional(),

   // JSON fields handling
   address: businessAddressSchema.optional(),
   phone: z.array(businessContactSchema).default([]),
   email: z.array(businessContactSchema).default([]),

   website: z.string().url().optional().nullable().or(z.literal("")),
   facebook: z.string().url().optional().nullable().or(z.literal("")),
   twitter: z.string().url().optional().nullable().or(z.literal("")),
   instagram: z.string().url().optional().nullable().or(z.literal("")),
   youtube: z.string().url().optional().nullable().or(z.literal("")),
});

export type BusinessInfoValues = z.infer<typeof businessInfoSchema>;
