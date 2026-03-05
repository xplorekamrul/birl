"use client";

import { searchProducts } from "@/actions/search";
import SignOutButton from "@/components/auth/SignOutButton";
import { Loader2, Menu, Package, Search, X, } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Role = "DEVELOPER" | "SUPER_ADMIN" | "ADMIN" | "USER" | "VENDOR";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  basePrice: any;
  salePrice: any;
  images: { url: string }[];
}

const commonNav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
];

const roleNav: Record<Role, { label: string; href: string }[]> = {
  DEVELOPER: [{ label: "Dev Tools", href: "/developer/tools" }],
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/super-admin/overview" },
    { label: "Users", href: "/super-admin/users" },
  ],
  ADMIN: [{ label: "Admin Panel", href: "/admin" }],
  USER: [
    { label: "My Account", href: "/user" },
    { label: "Orders", href: "/orders" },
    { label: "Wishlist", href: "/user/wishlist" },
  ],
  VENDOR: [
    { label: "Dashboard", href: "/vendor/dashboard" },
    { label: "Products", href: "/vendor/products" },
    { label: "Orders", href: "/vendor/orders" },
    { label: "Reports", href: "/vendor/reports" },
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

  // ── State ──────────────────────────────────────────────────────────────────
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // ── Search debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results as SearchResult[]);
          setSearchDropdownOpen(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Click-outside & Escape handlers ───────────────────────────────────────
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (!userMenuRef.current?.contains(t) && !userBtnRef.current?.contains(t)) {
        setUserMenuOpen(false);
      }
      if (!searchRef.current?.contains(t)) {
        setSearchDropdownOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // renderSearchResults — plain function, not a component, so no remount issues
  const renderSearchResults = (compact: boolean, onSelect: () => void) =>
    searchResults.map((product) => (
      <Link
        key={product.id}
        href={`/${product.slug}`}
        onClick={onSelect}
        className={`flex items-center gap-3 hover:bg-muted/60 transition-colors ${compact ? "p-2 rounded-md" : "p-3 border-b border-border last:border-b-0"
          }`}
      >
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className={`object-cover rounded shrink-0 ${compact ? "w-9 h-9" : "w-11 h-11"}`}
          />
        ) : (
          <div
            className={`bg-muted rounded flex items-center justify-center shrink-0 ${compact ? "w-9 h-9" : "w-11 h-11"
              }`}
          >
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          <p className="text-sm text-pcolor font-semibold">
            ${product.salePrice ?? product.basePrice}
          </p>
        </div>
      </Link>
    ));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
        <nav className="mx-auto max-w-6xl flex h-14 items-center gap-3 px-4">

          {/* ── Left: Brand + Nav Links (grouped together) ── */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 mr-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-pcolor/90">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <span className="font-semibold text-hcolor hidden sm:inline tracking-tight">
                Birl Ecommerce
              </span>
            </Link>

            {/* Desktop nav links — immediately after logo */}
            <ul className="hidden md:flex items-center gap-0.5">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="rounded-md px-3 py-1.5 text-sm text-foreground/75 hover:bg-muted/70 hover:text-foreground transition-colors"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Spacer pushes search + user to the right ── */}
          <div className="flex-1" />

          {/* ── Desktop Search ── */}
          <div className="hidden md:block w-64 relative" ref={searchRef}>
            {/* Inline input — NOT a sub-component to avoid remount/focus loss */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-9 rounded-md border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pcolor/40 focus:border-pcolor transition-colors"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 text-pcolor animate-spin" />
                </div>
              )}
              {!isSearching && searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchDropdownOpen(false); }}
                  className="absolute right-3 top-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  renderSearchResults(false, () => {
                    setSearchDropdownOpen(false);
                    setSearchQuery("");
                  })
                ) : !isSearching ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No products found for "{searchQuery}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Right: Mobile icons + Desktop user ── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Mobile: Search icon */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden rounded-md p-2 text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden rounded-md p-2 text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop: Auth / User Menu */}
            <div className="hidden md:flex items-center">
              {status === "loading" ? (
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              ) : user ? (
                <div className="relative">
                  <button
                    ref={userBtnRef}
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="rounded-full border-2 border-transparent hover:border-pcolor/40 transition-colors p-0.5"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pcolor/15 text-sm font-semibold text-pcolor">
                      {initials(user.name, user.email)}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div
                      ref={userMenuRef}
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50"
                    >
                      {/* User info */}
                      <div className="px-3 py-2 mb-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {user.name ?? user.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground mt-0.5">
                          {user.email}
                        </p>
                        {role && (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-pcolor/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pcolor">
                            {role}
                          </span>
                        )}
                      </div>

                      <div className="h-px bg-border mx-1 mb-1" />

                      {[
                        { label: "Profile", href: "/profile" },
                        { label: "Settings", href: "/settings" },
                        { label: "Help / Docs", href: "/help" },
                      ].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}

                      <div className="h-px bg-border mx-1 my-1" />

                      <div className="px-1">
                        <SignOutButton />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-1.5 text-sm text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-pcolor px-3 py-1.5 text-sm font-medium text-white hover:bg-scolor transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-card border-r border-border z-50 md:hidden flex flex-col overflow-hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-pcolor/90">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </span>
                <span className="font-semibold text-hcolor tracking-tight">Birl Ecommerce</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Search */}
              <div className="px-4 py-3 border-b border-border">
                {/* Inline input — NOT a sub-component to avoid remount/focus loss */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full h-9 pl-9 pr-9 rounded-md border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pcolor/40 focus:border-pcolor transition-colors"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-3.5 h-3.5 text-pcolor animate-spin" />
                    </div>
                  )}
                  {!isSearching && searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setSearchDropdownOpen(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && searchQuery.trim().length >= 2 && (
                  <div className="mt-2 space-y-0.5 max-h-52 overflow-y-auto">
                    {renderSearchResults(true, () => {
                      setMobileMenuOpen(false);
                      setSearchQuery("");
                    })}
                  </div>
                )}
                {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                  <p className="mt-2 text-xs text-muted-foreground text-center py-2">
                    No products found
                  </p>
                )}
              </div>

              {/* User info */}
              {user && (
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pcolor/15 text-sm font-semibold text-pcolor">
                      {initials(user.name, user.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground text-sm">
                        {user.name ?? user.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {role && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-pcolor/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pcolor">
                      {role}
                    </span>
                  )}
                </div>
              )}

              {/* Navigation */}
              <nav className="px-3 py-3">
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Navigation
                </p>
                <ul className="space-y-0.5">
                  {items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="flex items-center rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Account links */}
                {user && (
                  <>
                    <div className="h-px bg-border mx-1 my-3" />
                    <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      Account
                    </p>
                    <ul className="space-y-0.5">
                      {[
                        { label: "Profile", href: "/profile" },
                        { label: "Settings", href: "/settings" },
                        { label: "Help / Docs", href: "/help" },
                      ].map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-center rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </nav>
            </div>

            {/* Auth footer */}
            <div className="shrink-0 px-4 py-3 border-t border-border">
              {user ? (
                <SignOutButton />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center rounded-lg bg-pcolor px-3 py-2 text-sm font-medium text-white hover:bg-scolor transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}