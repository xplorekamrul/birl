"use server";

import { prisma } from "@/lib/prisma";

export async function getSuperAdminDashboardData() {
   try {
      // Fetch stats in parallel
      const [totalUsers, totalOrders, _totalRevenueRaw, activeVendors, recentActivitiesData] = await Promise.all([
         prisma.user.count(),
         prisma.order.count(),
         prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentStatus: "PAID" },
         }),
         prisma.vendorProfile.count({
            where: { status: "ACTIVE" },
         }),
         // Trying to combine various recents if possible, but let's query the latest 4-5 orders/users
         prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, name: true, createdAt: true, role: true },
         }),
      ]);

      const latestOrders = await prisma.order.findMany({
         orderBy: { createdAt: "desc" },
         take: 3,
         select: { id: true, user: { select: { name: true } }, createdAt: true, total: true },
      });

      const totalRevenue = _totalRevenueRaw._sum.total ? Number(_totalRevenueRaw._sum.total) : 0;

      // Formatting stats
      const stats = [
         { label: "Total Users", value: totalUsers.toString(), icon: "👥", color: "text-blue-500" },
         { label: "Total Orders", value: totalOrders.toString(), icon: "📦", color: "text-green-500" },
         {
            label: "Total Revenue",
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalRevenue),
            icon: "💰",
            color: "text-yellow-500",
         },
         { label: "Active Vendors", value: activeVendors.toString(), icon: "🏪", color: "text-purple-500" },
      ];

      // Formatting recent activities (mixing a few lists together simply for overview)
      type Activity = { type: string; description: string; time: string; date: Date };
      const activities: Activity[] = [];

      recentActivitiesData.forEach(user => {
         activities.push({
            type: "New User",
            description: `${user.name || "A user"} registered as ${user.role}`,
            time: formatTimeAgo(user.createdAt),
            date: user.createdAt,
         });
      });

      latestOrders.forEach(order => {
         activities.push({
            type: "New Order",
            description: `${order.user?.name || "Someone"} placed an order of $${Number(order.total).toFixed(2)}`,
            time: formatTimeAgo(order.createdAt),
            date: order.createdAt,
         });
      });

      // Sort combined activities by date desc and take top 5
      const recentActivities = activities
         .sort((a, b) => b.date.getTime() - a.date.getTime())
         .slice(0, 5)
         .map(a => ({ type: a.type, description: a.description, time: a.time }));

      return {
         stats,
         recentActivities,
         error: null,
      };

   } catch (error) {
      console.error("[GET_SUPER_ADMIN_DATA_ERROR]", error);
      return {
         stats: [],
         recentActivities: [],
         error: "Failed to load dashboard data.",
      };
   }
}

function formatTimeAgo(date: Date) {
   const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
   if (seconds < 60) return "Just now";
   const minutes = Math.floor(seconds / 60);
   if (minutes < 60) return `${minutes} minutes ago`;
   const hours = Math.floor(minutes / 60);
   if (hours < 24) return `${hours} hours ago`;
   const days = Math.floor(hours / 24);
   return `${days} days ago`;
}
