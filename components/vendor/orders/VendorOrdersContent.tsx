"use client";

import { getVendorOrders } from "@/actions/vendor/orders/get-vendor-orders";
import { updateOrderStatus } from "@/actions/vendor/orders/update-order-status";
import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderDetailsModal } from "./OrderDetailsModal";

export function VendorOrdersContent() {
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [filters, setFilters] = useState({
      status: "",
      search: "",
      startDate: "",
      endDate: "",
      page: 1,
   });
   const [total, setTotal] = useState(0);
   const [selectedOrder, setSelectedOrder] = useState<any>(null);
   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

   useEffect(() => {
      loadOrders();
   }, [filters]);

   const loadOrders = async () => {
      setLoading(true);
      const result = await getVendorOrders(filters as any);
      if (result?.data?.ok) {
         setOrders(result.data.orders);
         setTotal(result.data.total);
      }
      setLoading(false);
   };

   const handleStatusChange = async (orderId: string, newStatus: string) => {
      setUpdatingStatus(orderId);
      const result = await updateOrderStatus({ orderId, status: newStatus as any });
      if (result?.data?.ok) {
         setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
      setUpdatingStatus(null);
   };

   const exportCSV = () => {
      const csv = [
         ["Order ID", "Customer", "Date", "Items", "Total", "Status"].join(","),
         ...orders.map((o) =>
            [
               o.id,
               o.order.user.name,
               new Date(o.createdAt).toLocaleDateString(),
               o.items.length,
               o.vendorEarnings.toFixed(2),
               o.status,
            ].join(",")
         ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString()}.csv`;
      a.click();
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <button
               onClick={exportCSV}
               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
               <Download className="w-4 h-4" />
               Export CSV
            </button>
         </div>

         <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Search orders..."
                     value={filters.search}
                     onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                     className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
               </div>

               <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="px-4 py-2 border rounded-lg"
               >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
               </select>

               <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Start Date"
               />

               <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="End Date"
               />
            </div>
         </div>

         {loading ? (
            <div className="text-center py-12">Loading orders...</div>
         ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
               <p className="text-gray-500">No orders found</p>
            </div>
         ) : (
            <>
               <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                     <thead className="bg-gray-50 border-b">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {orders.map((order) => (
                           <tr key={order.id} className="hover:bg-gray-50">
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
                                 <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingStatus === order.id}
                                    className={`px-3 py-1 text-xs rounded-lg border-2 font-medium cursor-pointer ${order.status === "DELIVERED" ? "bg-green-50 text-green-800 border-green-200" :
                                       order.status === "SHIPPED" ? "bg-blue-50 text-blue-800 border-blue-200" :
                                          order.status === "PROCESSING" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
                                             order.status === "CANCELLED" ? "bg-red-50 text-red-800 border-red-200" :
                                                "bg-gray-50 text-gray-800 border-gray-200"
                                       } ${updatingStatus === order.id ? "opacity-50" : ""}`}
                                 >
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                 </select>
                              </td>
                              <td className="px-6 py-4">
                                 <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-blue-600 hover:underline text-sm font-medium"
                                 >
                                    View Details
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                     Showing {(filters.page - 1) * 20 + 1} to {Math.min(filters.page * 20, total)} of {total} orders
                  </p>
                  <div className="flex gap-2">
                     <button
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                     >
                        Previous
                     </button>
                     <button
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page * 20 >= total}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                     >
                        Next
                     </button>
                  </div>
               </div>
            </>
         )}

         {selectedOrder && (
            <OrderDetailsModal
               order={selectedOrder}
               onClose={() => setSelectedOrder(null)}
            />
         )}
      </div>
   );
}
