"use client";

import Link from "next/link";
import { memo } from "react";

interface OrderCardProps {
   order: {
      id: string;
      createdAt: string;
      status: string;
      vendorEarnings: number;
      items: any[];
      order: {
         user: {
            name: string;
            email: string;
         };
      };
   };
}

export const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
   const getStatusColor = (status: string) => {
      switch (status) {
         case "DELIVERED": return "bg-green-100 text-green-800";
         case "SHIPPED": return "bg-blue-100 text-blue-800";
         case "PROCESSING": return "bg-yellow-100 text-yellow-800";
         case "CANCELLED": return "bg-red-100 text-red-800";
         default: return "bg-gray-100 text-gray-800";
      }
   };

   return (
      <tr className="hover:bg-gray-50">
         <td className="px-6 py-4 text-sm font-mono">{order.id.slice(0, 8)}</td>
         <td className="px-6 py-4">
            <div>
               <p className="font-medium">{order.order.user.name}</p>
               <p className="text-sm text-gray-500">{order.order.user.email}</p>
            </div>
         </td>
         <td className="px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
         <td className="px-6 py-4 text-sm">{order.items.length}</td>
         <td className="px-6 py-4 font-semibold">${order.vendorEarnings.toFixed(2)}</td>
         <td className="px-6 py-4">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
               {order.status}
            </span>
         </td>
         <td className="px-6 py-4">
            <Link
               href={`/vendor/orders/${order.id}`}
               className="text-blue-600 hover:underline text-sm"
            >
               View Details
            </Link>
         </td>
      </tr>
   );
});
