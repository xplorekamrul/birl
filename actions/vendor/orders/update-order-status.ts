"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   orderId: z.string(),
   status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export const updateOrderStatus = vendorOnlyActionClient
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

      const { orderId, status } = parsedInput;

      // Verify this order belongs to the vendor
      const vendorOrder = await prisma.vendorOrder.findFirst({
         where: {
            id: orderId,
            vendorId: vendor.id,
         },
      });

      if (!vendorOrder) {
         return { ok: false as const, error: "Order not found" };
      }

      // Update the order status
      await prisma.vendorOrder.update({
         where: { id: orderId },
         data: { status },
      });

      return { ok: true as const };
   });
