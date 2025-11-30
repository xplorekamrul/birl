import { VendorOrderDetails } from "@/components/vendor/orders/VendorOrderDetails";
import { Suspense } from "react";

export default function VendorOrderDetailPage({ params }: { params: { id: string } }) {
   return (
      <div className="container mx-auto p-6">
         <Suspense fallback={<div>Loading order details...</div>}>
            <VendorOrderDetails orderId={params.id} />
         </Suspense>
      </div>
   );
}
