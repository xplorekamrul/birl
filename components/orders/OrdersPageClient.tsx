// src/app/(store)/orders/page.tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyOrders } from "@/actions/orders/get-my-orders";
import { redirect } from "next/navigation";
import { Package, Calendar, CreditCard, ChevronRight } from "lucide-react";

export const revalidate = 0;

// Server-safe formatter
function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function orderStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "CONFIRMED":
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "REFUNDED":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function paymentStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "PAID":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FAILED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default async function OrdersPage() {
  // ✅ Use the authenticated server action
  const result = await getMyOrders({});

  // Handle unauthenticated users
  if (!result?.data?.ok) {
    if (result?.data?.reason === "UNAUTHENTICATED") {
      redirect("/login?redirect=/orders");
    }
    // Handle other errors
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Card className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Unable to load orders. Please try again.
          </p>
          <Button asChild variant="outline">
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const orders = result.data.orders;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your recent purchases and view order details.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-slate-100 p-6">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t placed any orders. Start shopping to see your orders here.
            </p>
          </div>
          <Button
            asChild
            className="bg-pcolor text-white hover:bg-pcolor/90 mt-4"
          >
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const shortId = `#${order.id.slice(-8)}`;
            const totalItems = order.items?.reduce(
              (sum, i) => sum + (i.quantity || 0),
              0
            ) || 0;

            return (
              <Card 
                key={order.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/orders/${order.id}`}>
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            Order {shortId}
                          </h3>
                          <Badge
                            variant="outline"
                            className={orderStatusColor(order.status)}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDateTime(new Date(order.createdAt))}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            <span>
                              {totalItems} item{totalItems !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {formatBDT(order.total)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {order.currency}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={paymentStatusColor(order.paymentStatus)}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {order.paymentStatus}
                        </Badge>
                        {order.paymentMethod && (
                          <Badge variant="secondary" className="text-xs">
                            {order.paymentMethod}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-pcolor font-medium hover:gap-2 transition-all">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Customer Info (Optional) */}
                    {order.user && (
                      <div className="pt-3 border-t text-xs text-muted-foreground">
                        <span className="font-medium">{order.user.name || "Customer"}</span>
                        {order.user.email && (
                          <span className="ml-2">• {order.user.email}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}