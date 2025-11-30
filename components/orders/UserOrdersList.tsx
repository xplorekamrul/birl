"use client";

import { getMyOrders } from "@/actions/orders/get-my-orders";
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function UserOrdersList() {
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadOrders();
   }, []);

   const loadOrders = async () => {
      setLoading(true);
      const result = await getMyOrders({});
      if (result?.data?.ok) {
         setOrders(result.data.orders);
      }
      setLoading(false);
   };

   if (loading) {
      return <div className="text-center py-12">Loading your orders...</div>;
   }

   if (orders.length === 0) {
      return (
         <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
               Start Shopping
            </Link>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold">My Orders</h1>

         <div className="space-y-4">
            {orders.map((order) => (
               <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                           Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.currency}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                     <div className="flex items-center gap-2">
                        {order.status === "DELIVERED" ? (
                           <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : order.status === "CANCELLED" ? (
                           <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                           <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                              order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                 order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                                    order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                       "bg-gray-100 text-gray-800"
                           }`}>
                           {order.status}
                        </span>
                     </div>

                     <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                              order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                 "bg-red-100 text-red-800"
                           }`}>
                           Payment: {order.paymentStatus}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                     <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                     </p>
                     <span className="text-blue-600 hover:underline">View Details →</span>
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
}
