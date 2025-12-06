// src/actions/checkout/place-order.ts
"use server";

import { prisma } from "@/lib/prisma";
import { userActionClient } from "@/lib/safe-action/clients";
import {
  CheckoutFormSchema,
  CheckoutFormValues,
} from "@/lib/validations/checkout";
import { randomBytes } from "crypto";

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
        .catch(() => { });
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
      .catch(() => { });

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
        vendorId: true, // Fetch vendorId
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
          vendorId: true, // Fetch vendorId from variant as well (though usually same as product)
        },
      })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Collect all unique vendor IDs
    const vendorIds = new Set<string>();
    products.forEach(p => vendorIds.add(p.vendorId));
    // Variants might override vendor? Assuming product.vendorId is the source of truth for now unless multi-vendor variants exist (unlikely model)

    // Fetch vendor profiles for commission rates
    const vendorProfiles = await prisma.vendorProfile.findMany({
      where: { id: { in: Array.from(vendorIds) } },
      select: { id: true, commissionRate: true },
    });
    const vendorMap = new Map(vendorProfiles.map(v => [v.id, v]));

    let subtotalNumber = 0;

    // Prepare items with vendor info for grouping later
    const preparedItems: any[] = [];

    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Product not found during checkout.");
      }
      if (product.status !== "ACTIVE") {
        throw new Error("One of the products is not available.");
      }

      let unitPriceNumber = Number(product.salePrice ?? product.basePrice);
      let itemVendorId = product.vendorId;

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

        // If variant has specific vendor (e.g. dropshipping?), use it. Otherwise keep product vendor.
        if (variant.vendorId) itemVendorId = variant.vendorId;
      }

      const lineTotal = unitPriceNumber * item.quantity;
      subtotalNumber += lineTotal;

      preparedItems.push({
        ...item,
        vendorId: itemVendorId,
        pricePerUnit: unitPriceNumber,
        totalPrice: lineTotal
      });

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
      include: {
        items: true, // Include created items to get their IDs
      }
    });

    // 4.5) Create Vendor Orders
    // Group prepared items by vendor
    const itemsByVendor = new Map<string, typeof preparedItems>();

    // We need to map the created OrderItems back to our prepared items to link them
    // This is a bit tricky since we don't have a direct 1:1 link ID. 
    // But order of creation in `items: { create: [...] }` is usually preserved or we can match by product/variant.
    // Safer approach: Iterate through created `order.items` and match with `preparedItems`.

    for (const createdItem of order.items) {
      // Find matching prepared item (simple match by product/variant)
      const match = preparedItems.find(p =>
        p.productId === createdItem.productId &&
        p.variantId === createdItem.variantId &&
        p.quantity === createdItem.quantity // extra safety
      );

      if (match) {
        const vid = match.vendorId;
        if (!itemsByVendor.has(vid)) itemsByVendor.set(vid, []);
        itemsByVendor.get(vid)?.push({ ...match, orderItemId: createdItem.id });
      }
    }

    // Create VendorOrder for each vendor
    for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
      const vendorProfile = vendorMap.get(vendorId);
      const commissionRate = Number(vendorProfile?.commissionRate ?? 0.15);

      const vendorSubtotal = vendorItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      const commission = vendorSubtotal * commissionRate;
      const vendorEarnings = vendorSubtotal - commission;

      const vendorOrder = await prisma.vendorOrder.create({
        data: {
          orderId: order.id,
          vendorId: vendorId,
          status: "PENDING",
          subtotal: vendorSubtotal,
          commission: commission,
          vendorEarnings: vendorEarnings,
        }
      });

      // Link OrderItems to this VendorOrder
      const orderItemIds = vendorItems.map((i: any) => i.orderItemId);
      await prisma.orderItem.updateMany({
        where: { id: { in: orderItemIds } },
        data: { vendorOrderId: vendorOrder.id }
      });
    }

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
