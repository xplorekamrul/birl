"use client";

import { getOrderTracking } from "@/actions/orders/get-order-tracking";
import { ArrowLeft, CheckCircle, Clock, CreditCard, MapPin, Package, Truck, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function UserOrderTracking({ orderId }: { orderId: string }) {
   const [order, setOrder] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadOrder();
   }, [orderId]);

   const loadOrder = async () => {
      setLoading(true);
      const result = await getOrderTracking({ orderId });
      if (result?.data?.ok) {
         setOrder(result.data.order);
      }
      setLoading(false);
   };

   if (loading) {
      return <div className="text-center py-12">Loading order details...</div>;
   }

   if (!order) {
      return (
         <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Order not found</p>
            <Link href="/orders" className="text-blue-600 hover:underline">
               Back to Orders
            </Link>
         </div>
      );
   }

   const statusSteps = [
      { key: "PENDING", label: "Order Placed", icon: Package },
      { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
      { key: "PROCESSING", label: "Processing", icon: Clock },
      { key: "SHIPPED", label: "Shipped", icon: Truck },
      { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
   ];

   const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
               <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
               </p>
            </div>
         </div>

         {order.status !== "CANCELLED" && (
            <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-xl font-semibold mb-6">Order Status</h2>
               <div className="relative">
                  <div className="flex justify-between mb-8">
                     {statusSteps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                           <div key={step.key} className="flex-1 text-center relative">
                              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                                 } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}>
                                 <Icon className="w-6 h-6" />
                              </div>
                              <p className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                 {step.label}
                              </p>
                              {idx < statusSteps.length - 1 && (
                                 <div className={`absolute top-6 left-1/2 w-full h-1 ${idx < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                                    }`} style={{ zIndex: -1 }} />
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>

               {order.estimatedDelivery && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                     <p className="text-sm text-blue-900">
                        <strong>Estimated Delivery:</strong>{" "}
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                     </p>
                  </div>
               )}
            </div>
         )}

         {order.status === "CANCELLED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
               <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                     <h3 className="text-lg font-semibold text-red-900">Order Cancelled</h3>
                     <p className="text-red-700">This order has been cancelled</p>
                  </div>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                     <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order Items
                     </h2>
                  </div>
                  <div className="divide-y">
                     {order.items.map((item: any) => (
                        <div key={item.id} className="p-6 flex gap-4">
                           {item.product.images?.[0] && (
                              <Image
                                 src={item.product.images[0].url}
                                 alt={item.product.name}
                                 width={100}
                                 height={100}
                                 className="rounded object-cover"
                              />
                           )}
                           <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.product.name}</h3>
                              {item.variant && (
                                 <p className="text-sm text-gray-600">SKU: {item.variant.sku}</p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                              {item.vendorOrder && (
                                 <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                       Sold by: <span className="font-medium">{item.vendorOrder.vendor.shopName}</span>
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${item.vendorOrder.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                                          item.vendorOrder.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                             "bg-yellow-100 text-yellow-800"
                                       }`}>
                                       {item.vendorOrder.status}
                                    </span>
                                 </div>
                              )}
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-bold">${item.totalPrice.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">${item.pricePerUnit.toFixed(2)} each</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {order.fulfillments?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Tracking Information
                     </h2>
                     {order.fulfillments.map((fulfillment: any) => (
                        <div key={fulfillment.id} className="space-y-4">
                           {fulfillment.trackingNumber && (
                              <div className="p-4 bg-blue-50 rounded-lg">
                                 <p className="text-sm text-gray-600">Tracking Number</p>
                                 <p className="text-lg font-mono font-semibold">{fulfillment.trackingNumber}</p>
                                 {fulfillment.carrier && (
                                    <p className="text-sm text-gray-600 mt-1">Carrier: {fulfillment.carrier}</p>
                                 )}
                              </div>
                           )}

                           {fulfillment.events?.length > 0 && (
                              <div>
                                 <h3 className="font-semibold mb-3">Tracking History</h3>
                                 <div className="space-y-3">
                                    {fulfillment.events.map((event: any) => (
                                       <div key={event.id} className="flex gap-3">
                                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                          <div className="flex-1">
                                             <p className="font-medium">{event.status}</p>
                                             {event.description && (
                                                <p className="text-sm text-gray-600">{event.description}</p>
                                             )}
                                             {event.location && (
                                                <p className="text-sm text-gray-500">{event.location}</p>
                                             )}
                                             <p className="text-xs text-gray-400 mt-1">
                                                {new Date(event.occurredAt).toLocaleString()}
                                             </p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="space-y-6">
               {order.shippingAddress && (
                  <div className="bg-white rounded-lg shadow p-6">
                     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                     </h2>
                     <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                           {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                           {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="pt-2 text-gray-600">{order.shippingAddress.phone}</p>
                     </div>
                  </div>
               )}

               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <CreditCard className="w-5 h-5" />
                     Order Summary
                  </h2>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${order.shipping.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${order.tax.toFixed(2)}</span>
                     </div>
                     {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                           <span>Discount</span>
                           <span>-${order.discount.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                     </div>
                     <div className="pt-4 border-t">
                        <div className="flex justify-between">
                           <span className="text-gray-600">Payment Status</span>
                           <span className={`font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
                              }`}>
                              {order.paymentStatus}
                           </span>
                        </div>
                        {order.paymentMethod && (
                           <div className="flex justify-between mt-1">
                              <span className="text-gray-600">Payment Method</span>
                              <span className="font-medium">{order.paymentMethod}</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {order.vendorOrders?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                     <h2 className="text-lg font-semibold mb-4">Vendors</h2>
                     <div className="space-y-3">
                        {order.vendorOrders.map((vo: any) => (
                           <div key={vo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              {vo.vendor.shopLogo && (
                                 <Image
                                    src={vo.vendor.shopLogo}
                                    alt={vo.vendor.shopName}
                                    width={40}
                                    height={40}
                                    className="rounded"
                                 />
                              )}
                              <div className="flex-1">
                                 <p className="font-medium">{vo.vendor.shopName}</p>
                                 <span className={`text-xs px-2 py-1 rounded-full ${vo.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                                       vo.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                          "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {vo.status}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
