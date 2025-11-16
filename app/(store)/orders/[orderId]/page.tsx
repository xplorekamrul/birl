import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

// IMPORTANT: params is now a Promise
type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

// Server-safe formatter (don’t import from client store)
function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) return "-";
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

export default async function OrderDetailPage({ params }: PageProps) {
  // ✅ Unwrap params (Next.js 16 / Turbopack)
  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: { url: true },
              },
              vendor: {
                select: {
                  shopName: true,
                  shopSlug: true,
                },
              },
            },
          },
          variant: {
            include: {
              variantValues: {
                include: {
                  optionValue: {
                    include: {
                      option: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      fulfillments: {
        include: {
          items: true,
          events: true,
        },
      },
      payments: true,
      refunds: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shortId = `#${order.id.slice(-8)}`;

  const allTrackingEvents =
    order.fulfillments.flatMap((f) => f.events) ?? [];
  allTrackingEvents.sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
  );

  const shippingAddress = order.shippingAddress;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Order {shortId}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDateTime(order.createdAt)}
          </p>
          {order.user?.email && (
            <p className="text-xs text-muted-foreground">
              Ordered by {order.user.name ?? "Customer"} ({order.user.email})
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={orderStatusColor(order.status)}
          >
            Order: {order.status}
          </Badge>
          <Badge
            variant="outline"
            className={paymentStatusColor(order.paymentStatus)}
          >
            Payment: {order.paymentStatus}
          </Badge>
          {order.paymentMethod && (
            <Badge variant="outline">
              Method: {order.paymentMethod}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
        {/* Left: Items + Shipping + Timeline */}
        <div className="space-y-6">
          {/* Line items */}
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Order Items</h2>
            <div className="divide-y">
              {order.items.map((item) => {
                const product = item.product;
                const imageUrl = product.images[0]?.url ?? null;

                const variantLabel =
                  item.variant?.variantValues
                    .map((vv) => {
                      const opt = vv.optionValue.option?.name;
                      const val = vv.optionValue.value;
                      return opt ? `${opt}: ${val}` : val;
                    })
                    .join(" • ") ?? "";

                return (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product.slug}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.vendor?.shopName && (
                        <Link
                          href={`/vendor/${product.vendor.shopSlug}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          {product.vendor.shopName}
                        </Link>
                      )}
                      {variantLabel && (
                        <p className="text-xs text-muted-foreground">
                          {variantLabel}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • Type: {item.purchaseType}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        {formatBDT(Number(item.totalPrice))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatBDT(Number(item.pricePerUnit))} each
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shipping address */}
          <Card className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">Shipping Address</h2>
            {shippingAddress ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>
                  {shippingAddress.street}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                  <br />
                  {shippingAddress.country}
                </p>
                <p className="text-muted-foreground">
                  Phone: {shippingAddress.phone}
                  {shippingAddress.email ? ` • ${shippingAddress.email}` : ""}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No shipping address on file.
              </p>
            )}
          </Card>

          {/* Tracking / Timeline */}
          <Card className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">Shipment & Tracking</h2>
            {order.fulfillments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No shipment info yet. Your order is being prepared.
              </p>
            ) : allTrackingEvents.length === 0 ? (
              <div className="space-y-2 text-sm">
                {order.fulfillments.map((f) => (
                  <div
                    key={f.id}
                    className="space-y-1 rounded-md border border-slate-200 p-2"
                  >
                    <p>
                      Status:{" "}
                      <span className="font-medium">{f.status}</span>
                    </p>
                    {f.carrier && (
                      <p>
                        Carrier:{" "}
                        <span className="font-medium">{f.carrier}</span>
                      </p>
                    )}
                    {f.trackingNumber && (
                      <p>
                        Tracking:{" "}
                        <span className="font-mono text-xs">
                          {f.trackingNumber}
                        </span>
                      </p>
                    )}
                    {f.shippedAt && (
                      <p className="text-xs text-muted-foreground">
                        Shipped at {formatDateTime(f.shippedAt)}
                      </p>
                    )}
                    {f.deliveredAt && (
                      <p className="text-xs text-muted-foreground">
                        Delivered at {formatDateTime(f.deliveredAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ol className="space-y-3 text-sm">
                {allTrackingEvents.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-pcolor" />
                    <div>
                      <p className="font-medium">{ev.status}</p>
                      {ev.description && (
                        <p className="text-xs text-muted-foreground">
                          {ev.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ev.occurredAt)}
                        {ev.location ? ` • ${ev.location}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Right: totals + meta */}
        <div className="space-y-6">
          {/* Totals */}
          <Card className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatBDT(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatBDT(Number(order.shipping))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {formatBDT(Number(order.tax))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">
                  -{formatBDT(Number(order.discount))}
                </span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Total</span>
              <span className="text-base font-bold">
                {formatBDT(Number(order.total))}
              </span>
            </div>
          </Card>

          {/* Payments & refunds */}
          <Card className="p-4 space-y-3">
            <h2 className="text-sm font-semibold">Payments</h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payment records yet. Method: {order.paymentMethod ?? "N/A"}
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-md border border-slate-200 p-2"
                  >
                    <p className="flex items-center justify-between">
                      <span>
                        {p.method} •{" "}
                        <span className="font-medium">
                          {formatBDT(Number(p.amount))}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className={paymentStatusColor(p.status)}
                      >
                        {p.status}
                      </Badge>
                    </p>
                    {p.reference && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {p.reference}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(p.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {order.refunds.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2 text-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Refunds
                  </h3>
                  {order.refunds.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-md border border-slate-200 p-2"
                    >
                      <p className="flex items-center justify-between">
                        <span>
                          Amount:{" "}
                          <span className="font-medium">
                            {formatBDT(Number(r.amount))}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.status}
                        </span>
                      </p>
                      {r.reason && (
                        <p className="text-xs text-muted-foreground">
                          Reason: {r.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
