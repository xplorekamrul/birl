"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function debugVendorOrders() {
   const session = await auth();
   const userId = (session?.user as any)?.id;
   const userRole = (session?.user as any)?.role;

   console.log("=== DEBUG VENDOR ORDERS ===");
   console.log("User ID:", userId);
   console.log("User Role:", userRole);

   if (!userId) {
      return { error: "No user ID found" };
   }

   // Check if vendor profile exists
   const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, shopName: true, status: true },
   });

   console.log("Vendor Profile:", vendor);

   if (!vendor) {
      return { error: "No vendor profile found for this user" };
   }

   // Check total vendor orders
   const totalOrders = await prisma.vendorOrder.count({
      where: { vendorId: vendor.id },
   });

   console.log("Total Vendor Orders:", totalOrders);

   // Get sample orders
   const sampleOrders = await prisma.vendorOrder.findMany({
      where: { vendorId: vendor.id },
      take: 5,
      select: {
         id: true,
         status: true,
         vendorEarnings: true,
         createdAt: true,
      },
   });

   console.log("Sample Orders:", sampleOrders);

   // Check all orders in database
   const allOrdersCount = await prisma.vendorOrder.count();
   console.log("Total VendorOrders in DB:", allOrdersCount);

   // Convert Decimals to numbers for client
   const plainSampleOrders = sampleOrders.map(order => ({
      ...order,
      vendorEarnings: Number(order.vendorEarnings),
   }));

   return {
      userId,
      userRole,
      vendor,
      totalOrders,
      sampleOrders: plainSampleOrders,
      allOrdersCount,
   };
}
