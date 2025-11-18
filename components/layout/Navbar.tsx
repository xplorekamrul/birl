"use client";

import SignOutButton from "@/components/auth/SignOutButton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Role = "DEVELOPER" | "SUPER_ADMIN" | "ADMIN" | "USER" | "VENDOR";

const commonNav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
];

const roleNav: Record<Role, { label: string; href: string }[]> = {
  DEVELOPER: [{ label: "Dev Tools", href: "/developer/tools" }],
  SUPER_ADMIN: [{ label: "Dashboard", href: "/super-admin/overview" },
  { label: "Users", href: "/super-admin/users" }
  ],
  ADMIN: [{ label: "Admin Panel", href: "/admin" }],
  USER: [
    { label: "My Account", href: "/user" },
    { label: "Orders", href: "/user/orders" },
    { label: "Wishlist", href: "/user/wishlist" },
  ],
  VENDOR: [
    { label: "Vendor Dashboard", href: "/vendor" },
    { label: "Products", href: "/vendor/products" },
    { label: "Orders", href: "/vendor/orders" },
  ],
};

function mergeUnique(
  base: { label: string; href: string }[],
  extra: { label: string; href: string }[] = []
) {
  const seen = new Set<string>();
  const out: { label: string; href: string }[] = [];
  for (const item of [...base, ...extra]) {
    if (!seen.has(item.href)) {
      seen.add(item.href);
      out.push(item);
    }
  }
  return out;
}

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = (user?.role as Role | undefined) ?? undefined;

  const items = useMemo(
    () => mergeUnique(commonNav, role ? roleNav[role] : []),
    [role]
  );

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const clickedInsideMenu = !!menuRef.current?.contains(t);
      const clickedButton = !!btnRef.current?.contains(t);
      if (!clickedInsideMenu && !clickedButton) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl flex h-14 w-full items-center justify-between px-4">
        {/* Brand + Nav */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-md bg-pcolor/90" />
            <span className="font-semibold text-hcolor">Birl Ecommerce</span>
          </Link>

          <ul className="ml-4 hidden items-center gap-2 md:flex">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-muted/60 hover:text-foreground"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-full border border-border bg-background p-0.5 hover:border-foreground/30"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="User menu"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-foreground">
                  {initials(user.name, user.email)}
                </div>
              </button>

              {open ? (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card p-2 text-sm shadow-lg"
                >
                  <div className="px-2 py-1.5">
                    <p className="truncate font-medium text-foreground">
                      {user.name ?? user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {role ? (
                      <p className="mt-1 inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/80">
                        {role}
                      </p>
                    ) : null}
                  </div>

                  <div className="my-1 h-px w-full bg-border" />

                  <ul className="px-1 py-1">
                    <li>
                      <Link
                        href="/profile"
                        className="block rounded-md px-2 py-2 hover:bg-muted/70"
                        onClick={() => setOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="block rounded-md px-2 py-2 hover:bg-muted/70"
                        onClick={() => setOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/help"
                        className="block rounded-md px-2 py-2 hover:bg-muted/70"
                        onClick={() => setOpen(false)}
                      >
                        Help / Docs
                      </Link>
                    </li>
                  </ul>

                  <div className="my-1 h-px w-full bg-border" />

                  <div className="px-1 py-1">
                    <SignOutButton />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm hover:bg-muted/60"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-pcolor px-3 py-2 text-sm text-white hover:bg-scolor"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
