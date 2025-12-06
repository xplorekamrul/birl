"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const inputSchema = z.object({
   status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
   startDate: z.string().optional(),
   endDate: z.string().optional(),
   search: z.string().optional(),
   page: z.number().default(1),
   limit: z.number().default(20),
});

export const getVendorOrdersOptimized = vendorOnlyActionClient
   .schema(inputSchema)
   .action(async ({ parsedInput, ctx }) => {
      const userId = (ctx.session?.user as any)?.id;

      const vendor = await prisma.vendorProfile.findUnique({
         where: { userId },
         select: { id: true },
      });

      if (!vendor) {
         return { ok: false as const, error: "Vendor profile not found", orders: [], total: 0 };
      }

      const { status, startDate, endDate, search, page, limit } = parsedInput;
      const skip = (page - 1) * limit;

      const where: any = { vendorId: vendor.id };

      if (status) where.status = status;
      if (startDate || endDate) {
         where.createdAt = {};
         if (startDate) where.createdAt.gte = new Date(startDate);
         if (endDate) where.createdAt.lte = new Date(endDate);
      }
      if (search) {
         where.OR = [
            { id: { contains: search, mode: "insensitive" } },
            { order: { user: { name: { contains: search, mode: "insensitive" } } } },
            { order: { user: { email: { contains: search, mode: "insensitive" } } } },
         ];
      }

      // Optimized query with selective fields
      const [orders, total] = await Promise.all([
         prisma.vendorOrder.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
               id: true,
               status: true,
               createdAt: true,
               subtotal: true,
               commission: true,
               vendorEarnings: true,
               order: {
                  select: {
                     id: true,
                     status: true,
                     paymentStatus: true,
                     user: {
                        select: {
                           name: true,
                           email: true,
                        },
                     },
                  },
               },
               items: {
                  select: {
                     id: true,
                     quantity: true,
                     product: {
                        select: {
                           name: true,
                        },
                     },
                  },
               },
            },
         }),
         prisma.vendorOrder.count({ where }),
      ]);

      const plainOrders = orders.map((vo) => ({
         ...vo,
         subtotal: Number(vo.subtotal),
         commission: Number(vo.commission),
         vendorEarnings: Number(vo.vendorEarnings),
      }));

      return { ok: true as const, orders: plainOrders, total };
   });
