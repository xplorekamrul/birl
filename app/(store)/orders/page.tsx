import { UserOrdersList } from "@/components/orders/UserOrdersList";
import { Suspense } from "react";

export default function UserOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading your orders...</div>}>
        <UserOrdersList />
      </Suspense>
    </div>
  );
}
