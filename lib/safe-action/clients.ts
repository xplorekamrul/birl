// /lib/safe-action/clients.ts
import "server-only";
import { createSafeActionClient } from "next-safe-action";
import { auth } from "../auth";
import type { Session } from "next-auth";

export type Role = "DEVELOPER" | "SUPER_ADMIN" | "ADMIN" | "USER" | "VENDOR";

export const actionClient = createSafeActionClient();


function enforceRoles(session: Session | null, allowed: Role[]) {
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role = (session.user as any).role as Role | undefined;

  if (!role) {
    throw new Error("Forbidden");
  }

  if (role === "DEVELOPER" || role === "SUPER_ADMIN") {
    return { session, role };
  }

  if (!allowed.includes(role)) {
    throw new Error("Forbidden");
  }

  return { session, role };
}


export function createRoleActionClient(allowed: Role[]) {
  return actionClient.use(async ({ next }) => {
    const session = await auth();
    const { session: s, role } = enforceRoles(session, allowed);
    return next({ ctx: { session: s, role } });
  });
}

/**
 * Just needs login, no role restriction (old behavior of authActionClient).
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return next({ ctx: { session } });
});

/* ===== New convenience clients (for future use) ===== */

// USER only (plus Dev/Super)
export const userOnlyActionClient = createRoleActionClient(["USER"]);

// USER + ADMIN (plus Dev/Super) — use where admin may edit some user stuff
export const userAdminActionClient = createRoleActionClient(["USER", "ADMIN"]);

// VENDOR only (plus Dev/Super)
export const vendorOnlyActionClient = createRoleActionClient(["VENDOR"]);

// VENDOR + ADMIN (plus Dev/Super)
export const vendorAdminActionClient = createRoleActionClient(["VENDOR", "ADMIN"]);

// ADMIN only (plus Dev/Super)
export const adminOnlyActionClient = createRoleActionClient(["ADMIN"]);



// superAdminActionClient  -> only SUPER_ADMIN (plus DEVELOPER override)
export const superAdminActionClient = createRoleActionClient(["SUPER_ADMIN"]);

//  ADMIN only + Dev/Super override (same effective behavior)
export const adminActionClient = adminOnlyActionClient;

// developerActionClient -> DEVELOPER only
export const developerActionClient = createRoleActionClient(["DEVELOPER"]);

//  VENDOR + ADMIN + Dev/Super override (SuperAdmin already override)
export const vendorActionClient = createRoleActionClient(["VENDOR", "ADMIN"]);

// userActionClient -> "any logged-in user"
//  USER + VENDOR + ADMIN + Dev/Super override (i.e. effectively all roles)
export const userActionClient = createRoleActionClient(["USER", "VENDOR", "ADMIN"]);
