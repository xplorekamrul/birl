"use server";

import { prisma } from "@/lib/prisma";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const schema = z.object({
   startDate: z.string(),
   endDate: z.string(),
   groupBy: z.enum(["day", "month", "year"]).default("day"),
});

export const getVendorSalesReport = vendorOnlyActionClient
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

      const { startDate, endDate, groupBy } = parsedInput;

      const orders = await prisma.vendorOrder.findMany({
         where: {
            vendorId: vendor.id,
            createdAt: {
               gte: new Date(startDate),
               lte: new Date(endDate),
            },
         },
         select: {
            createdAt: true,
            status: true,
            subtotal: true,
            commission: true,
            vendorEarnings: true,
            items: {
               select: {
                  quantity: true,
                  product: { select: { name: true, id: true } },
               },
            },
         },
      });

      // Group by date
      const grouped: Record<string, any> = {};

      orders.forEach((order) => {
         let key: string;
         const date = new Date(order.createdAt);

         if (groupBy === "day") {
            key = date.toISOString().split("T")[0];
         } else if (groupBy === "month") {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
         } else {
            key = String(date.getFullYear());
         }

         if (!grouped[key]) {
            grouped[key] = {
               date: key,
               orders: 0,
               revenue: 0,
               commission: 0,
               earnings: 0,
               items: 0,
               products: {} as Record<string, { name: string; quantity: number }>,
            };
         }

         grouped[key].orders += 1;
         grouped[key].revenue += Number(order.subtotal);
         grouped[key].commission += Number(order.commission);
         grouped[key].earnings += Number(order.vendorEarnings);

         order.items.forEach((item) => {
            grouped[key].items += item.quantity;
            if (!grouped[key].products[item.product.id]) {
               grouped[key].products[item.product.id] = {
                  name: item.product.name,
                  quantity: 0,
               };
            }
            grouped[key].products[item.product.id].quantity += item.quantity;
         });
      });

      const report = Object.values(grouped).sort((a: any, b: any) =>
         a.date.localeCompare(b.date)
      );

      // Top products
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

      orders.forEach((order) => {
         order.items.forEach((item) => {
            if (!productSales[item.product.id]) {
               productSales[item.product.id] = {
                  name: item.product.name,
                  quantity: 0,
                  revenue: 0,
               };
            }
            productSales[item.product.id].quantity += item.quantity;
         });
      });

      const topProducts = Object.values(productSales)
         .sort((a, b) => b.quantity - a.quantity)
         .slice(0, 10);

      return {
         ok: true as const,
         report,
         topProducts,
         summary: {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + Number(o.subtotal), 0),
            totalCommission: orders.reduce((sum, o) => sum + Number(o.commission), 0),
            totalEarnings: orders.reduce((sum, o) => sum + Number(o.vendorEarnings), 0),
            totalItems: orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
         },
      };
   });
