"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   orderId: z.string(),
});

export const getVendorOrderDetails = vendorOnlyActionClient
   .schema(schema)
   .action(async ({ parsedInput, ctx }) => {
      const userId = (ctx.session?.user as any)?.id;

      const vendor = await prisma.vendorProfile.findUnique({
         where: { userId },
         select: { id: true },
      });

      if (!vendor) {
         return { ok: false as const, error: "Vendor profile not found" };
      }

      const vendorOrder = await prisma.vendorOrder.findFirst({
         where: {
            id: parsedInput.orderId,
            vendorId: vendor.id,
         },
         include: {
            order: {
               include: {
                  user: { select: { name: true, email: true, phone: true } },
                  shippingAddress: true,
                  payments: true,
               },
            },
            items: {
               include: {
                  product: {
                     select: { name: true, slug: true, images: { take: 1 } },
                  },
                  variant: { select: { sku: true } },
               },
            },
            Fulfillment: {
               include: {
                  items: true,
                  events: { orderBy: { occurredAt: "desc" } },
               },
            },
         },
      });

      if (!vendorOrder) {
         return { ok: false as const, error: "Order not found" };
      }

      const plainOrder = {
         ...vendorOrder,
         subtotal: Number(vendorOrder.subtotal),
         commission: Number(vendorOrder.commission),
         vendorEarnings: Number(vendorOrder.vendorEarnings),
         order: {
            ...vendorOrder.order,
            subtotal: Number(vendorOrder.order.subtotal),
            shipping: Number(vendorOrder.order.shipping),
            tax: Number(vendorOrder.order.tax),
            discount: Number(vendorOrder.order.discount),
            total: Number(vendorOrder.order.total),
            payments: vendorOrder.order.payments.map((p) => ({
               ...p,
               amount: Number(p.amount),
            })),
         },
         items: vendorOrder.items.map((item) => ({
            ...item,
            pricePerUnit: Number(item.pricePerUnit),
            totalPrice: Number(item.totalPrice),
         })),
      };

      return { ok: true as const, order: plainOrder };
   });
