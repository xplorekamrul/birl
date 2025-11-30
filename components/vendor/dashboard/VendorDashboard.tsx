"use client";

import { getVendorDashboardStats } from "@/actions/vendor/orders/get-dashboard-stats";
import { CheckCircle, Clock, DollarSign, Package, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function VendorDashboard() {
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all");

   useEffect(() => {
      loadStats();
   }, [dateRange]);

   const loadStats = async () => {
      setLoading(true);
      const now = new Date();
      let startDate: string | undefined;

      if (dateRange === "today") {
         startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      } else if (dateRange === "week") {
         startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (dateRange === "month") {
         startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      }

      const result = await getVendorDashboardStats({ startDate });
      if (result?.data?.ok) {
         setStats(result.data.stats);
      }
      setLoading(false);
   };

   if (loading) return <div className="text-center py-12">Loading dashboard...</div>;
   if (!stats) return <div className="text-center py-12">No data available</div>;

   const statCards = [
      { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "bg-blue-500" },
      { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "bg-yellow-500" },
      { label: "Processing", value: stats.processingOrders, icon: Package, color: "bg-orange-500" },
      { label: "Shipped", value: stats.shippedOrders, icon: Truck, color: "bg-purple-500" },
      { label: "Delivered", value: stats.deliveredOrders, icon: CheckCircle, color: "bg-green-500" },
      { label: "Cancelled", value: stats.cancelledOrders, icon: XCircle, color: "bg-red-500" },
   ];

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <div className="flex gap-2">
               {(["today", "week", "month", "all"] as const).map((range) => (
                  <button
                     key={range}
                     onClick={() => setDateRange(range)}
                     className={`px-4 py-2 rounded-lg capitalize ${dateRange === range
                           ? "bg-blue-600 text-white"
                           : "bg-gray-100 hover:bg-gray-200"
                        }`}
                  >
                     {range}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3">
               <DollarSign className="w-12 h-12" />
               <div>
                  <p className="text-sm opacity-90">Total Earnings</p>
                  <p className="text-4xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card) => (
               <div key={card.label} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-600">{card.label}</p>
                        <p className="text-3xl font-bold mt-1">{card.value}</p>
                     </div>
                     <div className={`${card.color} p-3 rounded-lg`}>
                        <card.icon className="w-6 h-6 text-white" />
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
               <h2 className="text-xl font-semibold">Recent Orders</h2>
            </div>
            <div className="divide-y">
               {stats.recentOrders.map((order: any) => (
                  <Link
                     key={order.id}
                     href={`/vendor/orders/${order.id}`}
                     className="block p-4 hover:bg-gray-50 transition"
                  >
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="font-medium">{order.order.user.name}</p>
                           <p className="text-sm text-gray-600">
                              {order.items.length} item(s) • {order.items.map((i: any) => i.product.name).join(", ")}
                           </p>
                           <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold">${order.vendorEarnings.toFixed(2)}</p>
                           <span className={`text-xs px-2 py-1 rounded-full ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                                 order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                    order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                                       "bg-gray-100 text-gray-800"
                              }`}>
                              {order.status}
                           </span>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
            <div className="p-4 text-center border-t">
               <Link href="/vendor/orders" className="text-blue-600 hover:underline">
                  View All Orders →
               </Link>
            </div>
         </div>
      </div>
   );
}
