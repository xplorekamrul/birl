"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   startDate: z.string().optional(),
   endDate: z.string().optional(),
});

export const getVendorDashboardStats = vendorOnlyActionClient
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

      const { startDate, endDate } = parsedInput;
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      const where: any = { vendorId: vendor.id };
      if (startDate || endDate) where.createdAt = dateFilter;

      const [
         totalOrders,
         pendingOrders,
         processingOrders,
         shippedOrders,
         deliveredOrders,
         cancelledOrders,
         earnings,
         recentOrders,
      ] = await Promise.all([
         prisma.vendorOrder.count({ where }),
         prisma.vendorOrder.count({ where: { ...where, status: "PENDING" } }),
         prisma.vendorOrder.count({ where: { ...where, status: "PROCESSING" } }),
         prisma.vendorOrder.count({ where: { ...where, status: "SHIPPED" } }),
         prisma.vendorOrder.count({ where: { ...where, status: "DELIVERED" } }),
         prisma.vendorOrder.count({ where: { ...where, status: "CANCELLED" } }),
         prisma.vendorOrder.aggregate({
            where,
            _sum: { vendorEarnings: true },
         }),
         prisma.vendorOrder.findMany({
            where: { vendorId: vendor.id },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
               order: {
                  select: {
                     user: { select: { name: true, email: true } },
                  },
               },
               items: {
                  select: {
                     product: { select: { name: true } },
                     quantity: true,
                  },
               },
            },
         }),
      ]);

      const plainRecentOrders = recentOrders.map((vo) => ({
         ...vo,
         subtotal: Number(vo.subtotal),
         commission: Number(vo.commission),
         vendorEarnings: Number(vo.vendorEarnings),
      }));

      return {
         ok: true as const,
         stats: {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalEarnings: Number(earnings._sum.vendorEarnings || 0),
            recentOrders: plainRecentOrders,
         },
      };
   });
