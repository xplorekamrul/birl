import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyOrders } from "@/actions/orders/get-my-orders";
import { redirect } from "next/navigation";
import { Package, Calendar } from "lucide-react";

export const revalidate = 0;


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
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default async function OrdersPage() {
  const result = await getMyOrders({});

  if (!result?.data?.ok) {
    if (result?.data?.reason === "UNAUTHENTICATED") {
      redirect("/login?redirect=/orders");
    }
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

      <div className="flex items-center justify-between pb-2 border-b bg-white sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-hcolor">My Orders</h1>

        <Button asChild variant="outline" size="sm" className="shadow-none">
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
          <h3 className="text-lg font-semibold">No orders yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t placed any orders. Start shopping to see your orders here.
          </p>

          <Button
            asChild
            className="bg-pcolor text-white hover:bg-pcolor/90 mt-4"
          >
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-[75vh] ">

          {orders.map((order) => {
            const totalItems =
              order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

            return (
              <div
                key={order.id}
                className="border-b  py-0 hover:bg-primary/5 transition-all"
              >
                <Link href={`/orders/${order.id}`}>
                  <div className="px-4 py-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                    <div className="space-y-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base text-slate-800">
                          Order #{order.id.slice(-8)}
                        </h3>

                        <Badge
                          variant="outline"
                          className={orderStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>

                        {order.paymentMethod && (
                          <Badge className="text-xs">
                            {order.paymentMethod}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateTime(new Date(order.createdAt))}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5" />
                          {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center text-sm">
                      {order.user?.name && (
                        <span className="font-medium text-slate-700">
                          {order.user.name}
                        </span>
                      )}
                      {order.user?.email && (
                        <span className="text-slate-500">{order.user.email}</span>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-center space-y-1">
                      <div className="text-lg font-bold text-slate-900">
                        {formatBDT(order.total)}
                      </div>

                      <span className="text-sm text-pcolor hover:underline cursor-pointer">
                        View Order
                      </span>
                    </div>

                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
