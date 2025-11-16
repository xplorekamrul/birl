// src/actions/orders/get-my-orders.ts
"use server";

import { prisma } from "@/lib/prisma";
import { userActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

// No payload needed, so just an empty object
const schema = z.object({});

export const getMyOrders = userActionClient
  .schema(schema)
  .action(async ({ ctx }) => {
    const sessionUser = ctx.session?.user as any | undefined;
    const userId = sessionUser?.id as string | undefined;
    const email = sessionUser?.email as string | undefined;

    if (!userId && !email) {
      return {
        ok: false as const,
        reason: "UNAUTHENTICATED" as const,
        orders: [] as any[],
      };
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          userId ? { userId } : undefined,
          email
            ? {
                user: {
                  email,
                },
              }
            : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true, // Decimal
        currency: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
    }); 

    // 🔁 Convert Prisma Decimal -> number so it’s serializable
    const plainOrders = orders.map((o) => ({
      ...o,
      total: Number(o.total),
    }));

    return {
      ok: true as const,
      reason: null,
      orders: plainOrders,
    };
  });
