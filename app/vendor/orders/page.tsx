import { OrdersLoadingSkeleton } from "@/components/vendor/orders/OrdersLoadingSkeleton";
import { VendorOrdersContent } from "@/components/vendor/orders/VendorOrdersContent";
import { Suspense } from "react";



export default function VendorOrdersPage() {
   return (
      <div className="container mx-auto p-6">
         <Suspense fallback={<OrdersLoadingSkeleton />}>
            <VendorOrdersContent />
         </Suspense>
      </div>
   );
}
