"use client";

import { getVendorOrderDetails } from "@/actions/vendor/orders/get-order-details";
import { updateVendorOrderStatus } from "@/actions/vendor/orders/update-order-status";
import { ArrowLeft, CreditCard, MapPin, Package, Truck, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function VendorOrderDetails({ orderId }: { orderId: string }) {
   const [order, setOrder] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [updating, setUpdating] = useState(false);
   const [trackingData, setTrackingData] = useState({ trackingNumber: "", carrier: "" });

   useEffect(() => {
      loadOrder();
   }, [orderId]);

   const loadOrder = async () => {
      setLoading(true);
      const result = await getVendorOrderDetails({ orderId });
      if (result?.data?.ok) {
         setOrder(result.data.order);
      }
      setLoading(false);
   };

   const updateStatus = async (status: any) => {
      setUpdating(true);
      const result = await updateVendorOrderStatus({
         orderId,
         status,
         ...trackingData,
      });
      if (result?.data?.ok) {
         await loadOrder();
      }
      setUpdating(false);
   };

   if (loading) return <div className="text-center py-12">Loading order...</div>;
   if (!order) return <div className="text-center py-12">Order not found</div>;

   const statusOptions = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
   const currentStatusIndex = statusOptions.indexOf(order.status);

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <Link href="/vendor/orders" className="p-2 hover:bg-gray-100 rounded-lg">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
               <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                     <Package className="w-5 h-5" />
                     Order Items
                  </h2>
                  <div className="space-y-4">
                     {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                           {item.product.images?.[0] && (
                              <Image
                                 src={item.product.images[0].url}
                                 alt={item.product.name}
                                 width={80}
                                 height={80}
                                 className="rounded object-cover"
                              />
                           )}
                           <div className="flex-1">
                              <h3 className="font-medium">{item.product.name}</h3>
                              {item.variant && (
                                 <p className="text-sm text-gray-600">SKU: {item.variant.sku}</p>
                              )}
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">${item.pricePerUnit.toFixed(2)} each</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                     <Truck className="w-5 h-5" />
                     Order Status & Tracking
                  </h2>

                  <div className="mb-6">
                     <div className="flex justify-between mb-2">
                        {statusOptions.slice(0, -1).map((status, idx) => (
                           <div key={status} className="flex-1 text-center">
                              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${idx <= currentStatusIndex ? "bg-blue-600 text-white" : "bg-gray-200"
                                 }`}>
                                 {idx < currentStatusIndex ? "✓" : idx + 1}
                              </div>
                              <p className="text-xs mt-1">{status}</p>
                           </div>
                        ))}
                     </div>
                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                           className="h-full bg-blue-600 transition-all"
                           style={{ width: `${(currentStatusIndex / (statusOptions.length - 2)) * 100}%` }}
                        />
                     </div>
                  </div>

                  {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium mb-2">Update Status</label>
                           <select
                              onChange={(e) => updateStatus(e.target.value)}
                              disabled={updating}
                              className="w-full px-4 py-2 border rounded-lg"
                              defaultValue=""
                           >
                              <option value="" disabled>Select new status</option>
                              {statusOptions.map((status) => (
                                 <option key={status} value={status} disabled={status === order.status}>
                                    {status}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {order.status === "PROCESSING" && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium mb-2">Tracking Number</label>
                                 <input
                                    type="text"
                                    value={trackingData.trackingNumber}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Enter tracking number"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium mb-2">Carrier</label>
                                 <input
                                    type="text"
                                    value={trackingData.carrier}
                                    onChange={(e) => setTrackingData({ ...trackingData, carrier: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="e.g., FedEx, UPS"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {order.Fulfillment?.length > 0 && (
                     <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold mb-3">Tracking Events</h3>
                        <div className="space-y-2">
                           {order.Fulfillment[0].events.map((event: any) => (
                              <div key={event.id} className="flex justify-between text-sm">
                                 <div>
                                    <p className="font-medium">{event.status}</p>
                                    <p className="text-gray-600">{event.description}</p>
                                 </div>
                                 <p className="text-gray-500">{new Date(event.occurredAt).toLocaleString()}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <User className="w-5 h-5" />
                     Customer
                  </h2>
                  <div className="space-y-2">
                     <p className="font-medium">{order.order.user.name}</p>
                     <p className="text-sm text-gray-600">{order.order.user.email}</p>
                     {order.order.user.phone && (
                        <p className="text-sm text-gray-600">{order.order.user.phone}</p>
                     )}
                  </div>
               </div>

               {order.order.shippingAddress && (
                  <div className="bg-white rounded-lg shadow p-6">
                     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                     </h2>
                     <div className="text-sm space-y-1">
                        <p>{order.order.shippingAddress.fullName}</p>
                        <p>{order.order.shippingAddress.street}</p>
                        <p>
                           {order.order.shippingAddress.city}, {order.order.shippingAddress.state}{" "}
                           {order.order.shippingAddress.postalCode}
                        </p>
                        <p>{order.order.shippingAddress.country}</p>
                        <p className="pt-2">{order.order.shippingAddress.phone}</p>
                     </div>
                  </div>
               )}

               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <CreditCard className="w-5 h-5" />
                     Payment Summary
                  </h2>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-red-600">
                        <span>Commission</span>
                        <span>-${order.commission.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                        <span>Your Earnings</span>
                        <span className="text-green-600">${order.vendorEarnings.toFixed(2)}</span>
                     </div>
                     <div className="pt-4 border-t">
                        <div className="flex justify-between text-gray-600">
                           <span>Payment Status</span>
                           <span className="font-medium">{order.order.paymentStatus}</span>
                        </div>
                        {order.order.paymentMethod && (
                           <div className="flex justify-between text-gray-600 mt-1">
                              <span>Payment Method</span>
                              <span className="font-medium">{order.order.paymentMethod}</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
