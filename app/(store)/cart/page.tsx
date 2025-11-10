export default async function CartPage() {
  const CartPageClient = (await import("@/components/cart/CartPageClient")).default;
  return <CartPageClient />;
}
