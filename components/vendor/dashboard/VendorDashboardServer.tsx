import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { VendorDashboardClient } from "./VendorDashboardClient";

// Cache the vendor stats for 60 seconds
const getCachedVendorStats = unstable_cache(
   async (vendorId: string, startDate?: Date, endDate?: Date) => {
      const where: any = { vendorId };
      if (startDate || endDate) {
         where.createdAt = {};
         if (startDate) where.createdAt.gte = startDate;
         if (endDate) where.createdAt.lte = endDate;
      }

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
            where: { vendorId },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
               id: true,
               status: true,
               createdAt: true,
               vendorEarnings: true,
               order: {
                  select: {
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
                     product: {
                        select: {
                           name: true,
                        },
                     },
                     quantity: true,
                  },
               },
            },
         }),
      ]);

      return {
         totalOrders,
         pendingOrders,
         processingOrders,
         shippedOrders,
         deliveredOrders,
         cancelledOrders,
         totalEarnings: Number(earnings._sum.vendorEarnings || 0),
         recentOrders: recentOrders.map((vo) => ({
            ...vo,
            vendorEarnings: Number(vo.vendorEarnings),
         })),
      };
   },
   ["vendor-dashboard-stats"],
   {
      revalidate: 60, // Cache for 60 seconds
      tags: ["vendor-stats"],
   }
);

export async function VendorDashboardServer() {
   const session = await auth();
   const userId = session?.user?.id;

   if (!userId) {
      redirect("/login");
   }

   // Get vendor profile
   const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, shopName: true },
   });

   if (!vendor) {
      redirect("/vendor/setup");
   }

   // Get cached stats
   const stats = await getCachedVendorStats(vendor.id);

   return <VendorDashboardClient initialStats={stats} vendorId={vendor.id} />;
}
