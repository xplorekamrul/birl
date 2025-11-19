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
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/super-admin/overview" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const clickedInsideMenu = !!menuRef.current?.contains(t);
      const clickedButton = !!btnRef.current?.contains(t);
      if (!clickedInsideMenu && !clickedButton) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl flex h-14 w-full items-center justify-between px-4">
        {/* Brand + Desktop Nav */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-md bg-pcolor/90" />
            <span className="font-semibold text-hcolor">Birl Ecommerce</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <ul className="hidden md:flex ml-4 items-center gap-2">
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
        <div className=" ml-auto flex items-center gap-3">
          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden rounded-md p-2 hover:bg-muted/60"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* User Menu - Hidden on mobile when drawer is open */}
          <div className={`${mobileMenuOpen ? "hidden" : ""} hidden md:block`}>
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
        </div>
      </nav>

      {/* Mobile Drawer - Only visible on mobile */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 md:hidden overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href="/"
                className="inline-flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="inline-block h-6 w-6 rounded-md bg-pcolor/90" />
                <span className="font-semibold text-hcolor">Birl Ecommerce</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-1 hover:bg-muted/60"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* User Info in Drawer */}
            {user && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                    {initials(user.name, user.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground text-sm">
                      {user.name ?? user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                {role && (
                  <p className="mt-2 inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/80">
                    {role}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="block rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-muted/60 hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* User Links */}
              {user && (
                <>
                  <div className="my-3 h-px w-full bg-border" />
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/profile"
                        className="block rounded-md px-3 py-2 text-sm hover:bg-muted/60"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="block rounded-md px-3 py-2 text-sm hover:bg-muted/60"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/help"
                        className="block rounded-md px-3 py-2 text-sm hover:bg-muted/60"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Help / Docs
                      </Link>
                    </li>
                  </ul>
                </>
              )}

              {/* Auth Buttons */}
              <div className="mt-4">
                {user ? (
                  <SignOutButton />
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block w-full rounded-md px-3 py-2 text-sm text-center hover:bg-muted/60"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full rounded-md bg-pcolor px-3 py-2 text-sm text-white text-center hover:bg-scolor"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}