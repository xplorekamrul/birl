"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   orderId: z.string(),
   status: z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
   trackingNumber: z.string().optional(),
   carrier: z.string().optional(),
});

export const updateVendorOrderStatus = vendorOnlyActionClient
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
      });

      if (!vendorOrder) {
         return { ok: false as const, error: "Order not found" };
      }

      const updated = await prisma.vendorOrder.update({
         where: { id: parsedInput.orderId },
         data: { status: parsedInput.status },
      });

      // Create fulfillment if shipped
      if (parsedInput.status === "SHIPPED" && (parsedInput.trackingNumber || parsedInput.carrier)) {
         await prisma.fulfillment.create({
            data: {
               orderId: vendorOrder.orderId,
               vendorOrderId: vendorOrder.id,
               status: "SHIPPED",
               trackingNumber: parsedInput.trackingNumber,
               carrier: parsedInput.carrier,
               shippedAt: new Date(),
            },
         });
      }

      return { ok: true as const, order: updated };
   });
