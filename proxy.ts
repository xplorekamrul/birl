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
  allow: Array<"AUTH" | typeof ROLE_ADMIN | typeof ROLE_SUPER | typeof ROLE_DEV | typeof ROLE_VENDOR | typeof ROLE_USER>;
}> = [
  { base: "/developer", allow: [ROLE_DEV] },
  { base: "/super-admin", allow: [ROLE_SUPER, ROLE_DEV] },
  { base: "/admin", allow: [ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },
  { base: "/vendor", allow: [ROLE_VENDOR, ROLE_ADMIN, ROLE_SUPER, ROLE_DEV] },
  { base: "/user", allow: ["AUTH"] }, 
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
    if (pathname === p || pathname.startsWith(p + "/")) return NextResponse.next();
  }

  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;

  const requireLogin = (redirectTo = "/login") => {
    url.pathname = redirectTo;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  };

  for (const { base, allow } of policies) {
    if (isUnder(pathname, base)) {
      // Needs auth?
      if (!session?.user) return requireLogin();

      if (allow.includes("AUTH")) return NextResponse.next();
      if (role && allow.includes(role as any)) {
        return NextResponse.next();
      }

      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

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
