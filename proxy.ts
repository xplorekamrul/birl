import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const ROLE_ADMIN = "ADMIN";
const ROLE_SUPER = "SUPER_ADMIN";
const ROLE_DEV = "DEVELOPER";
const ROLE_VENDOR = "VENDOR";
const ROLE_USER = "USER";

const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

const policies: Array<{
  base: string;
  allow: Array<
    | "AUTH"
    | typeof ROLE_ADMIN
    | typeof ROLE_SUPER
    | typeof ROLE_DEV
    | typeof ROLE_VENDOR
    | typeof ROLE_USER
  >;
}> = [
  // Only developer here
  { base: "/developer", allow: [ROLE_DEV] },

  // Super admin section – super admin + developer (dev has super power anyway)
  { base: "/super-admin", allow: [ROLE_SUPER, ROLE_DEV] },

  // Admin section – admin + super admin + developer
  { base: "/admin", allow: [ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },

  // Vendor section – vendor + admin + super admin + developer
  { base: "/vendor", allow: [ROLE_VENDOR, ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },

  // User section – user + admin + super admin + developer (NOT vendor)
  { base: "/user", allow: [ROLE_USER, ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },

  // Create section – vendor + admin + super admin + developer (NOT user)
  { base: "/create", allow: [ROLE_VENDOR, ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },
];

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Public assets & routes
  const publicPrefixes = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/favicon.ico",
    "/_next",
    "/assets",
    "/public",
  ];
  for (const p of publicPrefixes) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      return NextResponse.next();
    }
  }

  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;

  const requireLogin = (redirectTo = "/login") => {
    url.pathname = redirectTo;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  };

  // Apply policies
  for (const { base, allow } of policies) {
    if (isUnder(pathname, base)) {
      // Needs auth at all
      if (!session?.user) return requireLogin();

      // Super power: developer & super admin can access any matched route
      if (role === ROLE_DEV || role === ROLE_SUPER) {
        return NextResponse.next();
      }

      // Routes that allow "any authenticated user"
      if (allow.includes("AUTH")) {
        return NextResponse.next();
      }

      // Normal role-based check
      if (role && allow.includes(role as any)) {
        return NextResponse.next();
      }

      // Not allowed → unauthorized page
      url.pathname = "/unauthorized";
      url.searchParams.delete("callbackUrl");
      return NextResponse.redirect(url);
    }
  }

  // No policy matched → let it pass
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/developer/:path*",
    "/super-admin/:path*",
    "/admin/:path*",
    "/vendor/:path*",
    "/user/:path*",
    "/create/:path*",
  ],
};
