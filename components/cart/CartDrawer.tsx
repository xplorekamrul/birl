export default async function CartDrawer() {
  const CartDrawerClient = (await import("./CartDrawerClient")).default;
  return <CartDrawerClient />;
}
