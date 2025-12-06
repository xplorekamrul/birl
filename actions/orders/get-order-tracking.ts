"use server";

import { prisma } from "@/lib/prisma";
import { userActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   orderId: z.string(),
});

export const getOrderTracking = userActionClient
   .schema(schema)
   .action(async ({ parsedInput, ctx }) => {
      const userId = (ctx.session?.user as any)?.id;

      const order = await prisma.order.findFirst({
         where: {
            id: parsedInput.orderId,
            userId,
         },
         include: {
            shippingAddress: true,
            items: {
               include: {
                  product: {
                     select: { name: true, images: { take: 1 } },
                  },
                  variant: { select: { sku: true } },
                  vendorOrder: {
                     select: {
                        status: true,
                        vendor: { select: { shopName: true } },
                     },
                  },
               },
            },
            fulfillments: {
               include: {
                  events: { orderBy: { occurredAt: "desc" } },
               },
            },
            vendorOrders: {
               include: {
                  vendor: { select: { shopName: true, shopLogo: true } },
               },
            },
         },
      });

      if (!order) {
         return { ok: false as const, error: "Order not found" };
      }

      const plainOrder = {
         ...order,
         subtotal: Number(order.subtotal),
         shipping: Number(order.shipping),
         tax: Number(order.tax),
         discount: Number(order.discount),
         total: Number(order.total),
         items: order.items.map((item) => ({
            ...item,
            pricePerUnit: Number(item.pricePerUnit),
            totalPrice: Number(item.totalPrice),
         })),
         vendorOrders: order.vendorOrders.map((vo) => ({
            ...vo,
            subtotal: Number(vo.subtotal),
            commission: Number(vo.commission),
            vendorEarnings: Number(vo.vendorEarnings),
         })),
      };

      return { ok: true as const, order: plainOrder };
   });
