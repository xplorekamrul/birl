// src/components/checkout/CheckoutPageClient.tsx
"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useCartStore, formatBDT } from "@/store/cart";
import { placeOrder } from "@/actions/checkout/place-order";
import { useAction } from "next-safe-action/hooks";

import {
  CheckoutAddressSchema,
  CheckoutAddressValues,
  CheckoutFormValues
} from "@/lib/validations/checkout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

type Props = {
  isAuthenticated: boolean;
  initialUser: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  initialAddress: {
    fullName: string | null;
    phone: string | null;
    email: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
};

export default function CheckoutPageClient({
  isAuthenticated,
  initialUser,
  initialAddress,
}: Props) {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutAddressValues>({
    resolver: zodResolver(CheckoutAddressSchema),
    defaultValues: {
      email: initialAddress?.email ?? initialUser?.email ?? "",
      fullName:
        initialAddress?.fullName ??
        initialUser?.name ??
        "",
      phone:
        initialAddress?.phone ??
        initialUser?.phone ??
        "",
      street: initialAddress?.street ?? "",
      city: initialAddress?.city ?? "",
      state: initialAddress?.state ?? "",
      postalCode: initialAddress?.postalCode ?? "",
      country: initialAddress?.country ?? "Bangladesh",
    },
  });

  const { execute, status, result } = useAction(placeOrder, {
    onSuccess({ data }) {
      if (!data) return;

      if (!data.ok) {
        console.error(data.message ?? "Could not place order");
        // toast.error(data.message ?? "Could not place order");
        return;
      }

      // Clear local cart on success
      clear();

      // toast.success("Order placed successfully");
      router.push(`/orders/${data.orderId}`);
    },
    onError(err) {
      console.error(err);
      // toast.error("Something went wrong");
    },
  });

  const loading = status === "executing";

  const onSubmit = (values: CheckoutAddressValues) => {
    if (items.length === 0) {
      // toast.error("Your cart is empty");
      return;
    }

    const payload: CheckoutFormValues = {
      ...values,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
        purchaseType: i.purchaseType ?? "NEW",
      })),
    };

    execute(payload);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Button asChild className="bg-pcolor text-white hover:bg-pcolor/90">
          <Link href="/shop">Go to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1.3fr]">
      {/* Left: customer + address form */}
      <section>
        <h1 className="mb-4 text-xl font-semibold">
          Checkout {isAuthenticated ? "(Logged in)" : "(Guest)"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card className="space-y-4 p-4">
            <h2 className="text-sm font-semibold">
              Contact & Address
            </h2>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full name */}
              <div className="space-y-1">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Street */}
            <div className="space-y-1">
              <Label htmlFor="street">Street address</Label>
              <Input id="street" {...register("street")} />
              {errors.street && (
                <p className="text-xs text-red-600">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* City */}
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-xs text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* State */}
              <div className="space-y-1">
                <Label htmlFor="state">State / Area</Label>
                <Input id="state" {...register("state")} />
                {errors.state && (
                  <p className="text-xs text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

              {/* Postal code */}
              <div className="space-y-1">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-xs text-red-600">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="space-y-1">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
              {errors.country && (
                <p className="text-xs text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>
          </Card>

          <Button
            type="submit"
            className="bg-pcolor text-white hover:bg-pcolor/90"
            disabled={loading}
          >
            {loading ? "Placing order..." : "Place order (Cash on Delivery)"}
          </Button>

          {result.data && !result.data.ok && (
            <p className="text-sm text-red-600 mt-2">
              {result.data.message}
            </p>
          )}
        </form>
      </section>

      {/* Right: order summary from local cart */}
      <section>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">
            Order Summary
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.vendorName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.vendorName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right text-sm font-semibold">
                  {formatBDT(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {formatBDT(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">
                {shipping === 0
                  ? "Calculated later (0 for now)"
                  : formatBDT(shipping)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-muted-foreground">
                {tax === 0
                  ? "Included"
                  : formatBDT(tax)}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm">
            <span>Total</span>
            <span className="text-base font-bold">
              {formatBDT(total)}
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
}
