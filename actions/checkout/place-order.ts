// src/actions/checkout/place-order.ts
"use server";

import { prisma } from "@/lib/prisma";
import { userActionClient } from "@/lib/safe-action/clients";
import { randomBytes } from "crypto";
import {
  CheckoutFormSchema,
  CheckoutFormValues,
} from "@/lib/validations/checkout";

export const placeOrder = userActionClient
  .schema(CheckoutFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    const sessionUserId = (ctx.session?.user as any)?.id as string | undefined;

    const {
      email,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      items,
    } = parsedInput as CheckoutFormValues;

    if (items.length === 0) {
      return { ok: false as const, message: "Your cart is empty." };
    }

    // 1) Resolve or create user (for guests)
    let userId: string;

    if (sessionUserId) {
      userId = sessionUserId;
      // Optionally update user's phone if missing
      await prisma.user
        .update({
          where: { id: userId },
          data: {
            name: fullName,
            phone,
          },
        })
        .catch(() => {});
    } else {
      // Guest: find or create by email
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingByEmail) {
        userId = existingByEmail.id;
      } else {
        const randomPassword = randomBytes(16).toString("hex"); // TODO: hash in real auth setup
        const newUser = await prisma.user.create({
          data: {
            name: fullName,
            email,
            password: randomPassword,
            role: "USER",
            status: "ACTIVE",
            phone,
          },
        });
        userId = newUser.id;
      }
    }

    // 2) Create / update default address for this user
    const address = await prisma.address.create({
      data: {
        userId,
        type: "BOTH",
        label: "Checkout address",
        fullName,
        phone,
        email,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: true,
      },
    });

    // Optional: unset old default addresses
    await prisma.address
      .updateMany({
        where: {
          userId,
          id: { not: address.id },
          isDefault: true,
        },
        data: { isDefault: false },
      })
      .catch(() => {});

    // 3) Validate products & compute totals
    const productIds = Array.from(new Set(items.map((i) => i.productId)));

    const variantIds = Array.from(
      new Set(
        items
          .map((i) => i.variantId)
          .filter((id): id is string => !!id)
      )
    );

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        basePrice: true,
        salePrice: true,
        status: true,
      },
    });

    const variants = variantIds.length
      ? await prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          select: {
            id: true,
            productId: true,
            price: true,
            salePrice: true,
          },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let subtotalNumber = 0;

    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Product not found during checkout.");
      }
      if (product.status !== "ACTIVE") {
        throw new Error("One of the products is not available.");
      }

      let unitPriceNumber = Number(product.salePrice ?? product.basePrice);

      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.productId !== product.id) {
          throw new Error("Invalid variant in cart.");
        }
        unitPriceNumber =
          variant.salePrice != null
            ? Number(variant.salePrice)
            : variant.price != null
            ? Number(variant.price)
            : unitPriceNumber;
      }

      const lineTotal = unitPriceNumber * item.quantity;
      subtotalNumber += lineTotal;

      return {
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        purchaseType: item.purchaseType,
        pricePerUnit: unitPriceNumber,
        totalPrice: lineTotal,
      };
    });

    const shippingNumber = 0;
    const taxNumber = 0;
    const discountNumber = 0;
    const totalNumber =
      subtotalNumber + shippingNumber + taxNumber - discountNumber;

    // 4) Create Order + OrderItems
    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        currency: "BDT",

        shippingAddressId: address.id,

        billingFullName: fullName,
        billingPhone: phone,
        billingStreet: street,
        billingCity: city,
        billingState: state,
        billingPostalCode: postalCode,
        billingCountry: country,

        subtotal: subtotalNumber,
        shipping: shippingNumber,
        tax: taxNumber,
        discount: discountNumber,
        total: totalNumber,

        paymentMethod: "COD",

        items: {
          create: orderItemsData,
        },
      },
    });

    // 5) Clear DB cart for logged-in users (if any)
    if (sessionUserId) {
      const cart = await prisma.cart.findFirst({
        where: { userId: sessionUserId },
        select: { id: true },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    return {
      ok: true as const,
      message: "Order placed successfully.",
      orderId: order.id,
    };
  });
