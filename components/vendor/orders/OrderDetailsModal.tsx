"use client";

import { X } from "lucide-react";

interface OrderDetailsModalProps {
   order: any;
   onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
               <h2 className="text-2xl font-bold">Order Details</h2>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6 space-y-6">
               {/* Order Info */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm text-gray-500">Order ID</p>
                     <p className="font-mono font-semibold">{order.id}</p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Date</p>
                     <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Status</p>
                     <span className={`inline-block px-3 py-1 text-sm rounded-full ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                           order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                              order.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                                 order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                    "bg-gray-100 text-gray-800"
                        }`}>
                        {order.status}
                     </span>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Your Earnings</p>
                     <p className="font-bold text-lg text-green-600">${order.vendorEarnings.toFixed(2)}</p>
                  </div>
               </div>

               {/* Customer Info */}
               <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{order.order.user.name}</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{order.order.user.email}</p>
                     </div>
                     {order.order.user.phone && (
                        <div>
                           <p className="text-sm text-gray-500">Phone</p>
                           <p className="font-medium">{order.order.user.phone}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Shipping Address */}
               {order.order.shippingAddress && (
                  <div className="border-t pt-4">
                     <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{order.order.shippingAddress.street}</p>
                        <p>{order.order.shippingAddress.city}, {order.order.shippingAddress.state} {order.order.shippingAddress.postalCode}</p>
                        <p>{order.order.shippingAddress.country}</p>
                     </div>
                  </div>
               )}

               {/* Order Items */}
               <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                  <div className="space-y-3">
                     {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                           <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              {item.variant?.sku && (
                                 <p className="text-sm text-gray-500">SKU: {item.variant.sku}</p>
                              )}
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">${item.pricePerUnit.toFixed(2)} each</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Order Summary */}
               <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                     <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Commission</span>
                        <span className="text-red-600">-${order.commission.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Your Earnings</span>
                        <span className="text-green-600">${order.vendorEarnings.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
