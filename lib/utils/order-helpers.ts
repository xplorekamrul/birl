export function getOrderStatusColor(status: string): string {
   const colors: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REFUNDED: "bg-orange-100 text-orange-800",
   };
   return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentStatusColor(status: string): string {
   const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-orange-100 text-orange-800",
      PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
   };
   return colors[status] || "bg-gray-100 text-gray-800";
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
   }).format(amount);
}

export function formatDate(date: string | Date): string {
   return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });
}

export function formatDateTime(date: string | Date): string {
   return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

export function getOrderStatusSteps() {
   return [
      { key: "PENDING", label: "Order Placed" },
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "PROCESSING", label: "Processing" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
   ];
}

export function calculateOrderProgress(status: string): number {
   const steps = getOrderStatusSteps();
   const currentIndex = steps.findIndex((s) => s.key === status);
   return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
}

export function canUpdateOrderStatus(currentStatus: string, newStatus: string): boolean {
   const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: [],
      CANCELLED: [],
   };
   return validTransitions[currentStatus]?.includes(newStatus) || false;
}

export function getNextOrderStatus(currentStatus: string): string | null {
   const nextStatus: Record<string, string> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PROCESSING",
      PROCESSING: "SHIPPED",
      SHIPPED: "DELIVERED",
   };
   return nextStatus[currentStatus] || null;
}
