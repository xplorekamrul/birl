"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../lib/auth";

export async function toggleWishlist(productId: string) {
   try {
      const session = await auth();

      // If user is not logged in, return success (client will handle localStorage)
      if (!session?.user?.id) {
         return { ok: true, inWishlist: true, message: "Added to wishlist", requiresAuth: false };
      }

      const userId = session.user.id;

      // Check if already in wishlist
      const existing = await prisma.wishlistItem.findUnique({
         where: {
            userId_productId: {
               userId,
               productId,
            },
         },
      });

      if (existing) {
         // Remove from wishlist
         await prisma.wishlistItem.delete({
            where: {
               id: existing.id,
            },
         });
         return { ok: true, inWishlist: false, message: "Removed from wishlist", requiresAuth: true };
      } else {
         // Add to wishlist
         await prisma.wishlistItem.create({
            data: {
               userId,
               productId,
            },
         });
         return { ok: true, inWishlist: true, message: "Added to wishlist", requiresAuth: true };
      }
   } catch (error) {
      console.error("Wishlist error:", error);
      return { ok: false, message: "Failed to update wishlist", requiresAuth: false };
   }
}

export async function getWishlistStatus(productIds: string[]) {
   try {
      const session = await auth();

      if (!session?.user?.id) {
         return {};
      }

      const wishlistItems = await prisma.wishlistItem.findMany({
         where: {
            userId: session.user.id,
            productId: {
               in: productIds,
            },
         },
         select: {
            productId: true,
         },
      });

      const statusMap: Record<string, boolean> = {};
      wishlistItems.forEach((item) => {
         statusMap[item.productId] = true;
      });

      return statusMap;
   } catch (error) {
      console.error("Get wishlist status error:", error);
      return {};
   }
}

export async function getWishlistItems() {
   try {
      const session = await auth();

      if (!session?.user?.id) {
         return { ok: true, items: [] };
      }

      const wishlistItems = await prisma.wishlistItem.findMany({
         where: {
            userId: session.user.id,
         },
         include: {
            product: {
               select: {
                  id: true,
                  name: true,
                  slug: true,
                  basePrice: true,
                  salePrice: true,
                  shortDescription: true,
                  images: {
                     select: {
                        url: true,
                     },
                     take: 1,
                  },
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      // Convert Decimal to number for client components
      const serializedItems = wishlistItems.map((item) => ({
         id: item.id,
         product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            basePrice: Number(item.product.basePrice),
            salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
            shortDescription: item.product.shortDescription,
            images: item.product.images,
         },
      }));

      return { ok: true, items: serializedItems };
   } catch (error) {
      console.error("Get wishlist error:", error);
      return { ok: false, items: [] };
   }
}

export async function removeFromWishlist(productId: string) {
   try {
      const session = await auth();

      if (!session?.user?.id) {
         return { ok: false, message: "Unauthorized" };
      }

      await prisma.wishlistItem.deleteMany({
         where: {
            userId: session.user.id,
            productId,
         },
      });

      return { ok: true, message: "Removed from wishlist" };
   } catch (error) {
      console.error("Remove from wishlist error:", error);
      return { ok: false, message: "Failed to remove" };
   }
}

export async function syncWishlistWithDB(localProductIds: string[]) {
   try {
      const session = await auth();

      if (!session?.user?.id) {
         return { ok: false, message: "Not authenticated" };
      }

      const userId = session.user.id;

      // Get existing wishlist from DB
      const existingItems = await prisma.wishlistItem.findMany({
         where: { userId },
         select: { productId: true },
      });

      const existingProductIds = existingItems.map((item) => item.productId);

      // Find items to add (in local but not in DB)
      const toAdd = localProductIds.filter((id) => !existingProductIds.includes(id));

      // Add missing items to DB
      if (toAdd.length > 0) {
         await prisma.wishlistItem.createMany({
            data: toAdd.map((productId) => ({
               userId,
               productId,
            })),
            skipDuplicates: true,
         });
      }

      // Return all product IDs that should be in wishlist
      const allProductIds = [...new Set([...existingProductIds, ...localProductIds])];

      return { ok: true, productIds: allProductIds };
   } catch (error) {
      console.error("Sync wishlist error:", error);
      return { ok: false, message: "Failed to sync" };
   }
}
