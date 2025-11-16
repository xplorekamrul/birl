// src/lib/validation/checkout.ts
import { z } from "zod";

// Match your PurchaseType enum
export const CheckoutItemInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  purchaseType: z.enum(["NEW", "REFURBISHED", "RENT", "HIRE_PURCHASE", "PRE_ORDER"]),
});

// Address / customer info 
export const CheckoutAddressSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().min(5),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

// Full payload sent to the server action
export const CheckoutFormSchema = CheckoutAddressSchema.extend({
  items: z.array(CheckoutItemInputSchema).min(1),
});

export type CheckoutItemInput = z.infer<typeof CheckoutItemInputSchema>;
export type CheckoutAddressValues = z.infer<typeof CheckoutAddressSchema>;
export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
