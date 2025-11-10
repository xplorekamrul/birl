"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { userActionClient } from "@/lib/safe-action/clients";

// Keep in sync with your enum
const PurchaseTypeEnum = z.enum(["NEW", "REFURBISHED", "RENT", "HIRE_PURCHASE", "PRE_ORDER"]);

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().optional().nullable(),
  purchaseType: PurchaseTypeEnum.optional().default("NEW"),
});

export const addToCart = userActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { productId, quantity, variantId, purchaseType } = parsedInput;
    const userId = (ctx.session.user as any).id as string;

    // 1) Find or create the user's cart
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId, currency: "BDT" } });
    }

    // 2) Resolve product + (optional) variant and unit price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        basePrice: true,
        salePrice: true,
        status: true,
      },
    });
    if (!product) {
      return { ok: false as const, message: "Product not found." };
    }
    if (product.status !== "ACTIVE") {
      return { ok: false as const, message: "Product is not available." };
    }

    let unitPriceNumber = Number(product.salePrice ?? product.basePrice);

    if (variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: { id: variantId, productId, isActive: true },
        select: { price: true, salePrice: true },
      });
      if (!variant) {
        return { ok: false as const, message: "Variant not available." };
      }
      // prefer variant salePrice, then variant price, then product sale/base
      const variantUnit =
        variant.salePrice != null
          ? Number(variant.salePrice)
          : variant.price != null
          ? Number(variant.price)
          : unitPriceNumber;

      unitPriceNumber = variantUnit;
    }

    // 3) Upsert the cart item (respect unique composite)
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
        purchaseType,
      },
      select: { id: true, quantity: true },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          unitPrice: unitPriceNumber, // Prisma accepts number for Decimal
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? null,
          purchaseType,
          quantity,
          unitPrice: unitPriceNumber,
          currency: "BDT",
        },
      });
    }

    return { ok: true as const, message: "Added to cart." };
  });
