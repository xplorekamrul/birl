// src/app/(store)/checkout/page.tsx
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export default async function CheckoutPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  let initialUser: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null = null;

  let initialAddress:
    | {
      fullName: string | null;
      phone: string | null;
      email: string | null;
      street: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      country: string | null;
    }
    | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "desc" },
      select: {
        fullName: true,
        phone: true,
        email: true,
        street: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
      },
    });

    if (user) {
      initialUser = {
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
      };
    }

    if (address) {
      initialAddress = {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <CheckoutPageClient
        isAuthenticated={!!userId}
        initialUser={initialUser}
        initialAddress={initialAddress}
      />
    </main>
  );
}
