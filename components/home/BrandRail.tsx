"use client";

import Link from "next/link";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export default function BrandRail({ data }: { data: Brand[] }) {
  if (!data?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold">Top Brands</h2>
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {data.map((b) => (
          <Link
            key={b.id}
            href={`/shop?brand=${encodeURIComponent(b.slug)}`}
            className="shrink-0 border rounded-2xl bg-white hover:shadow transition p-4 flex items-center justify-center h-20 w-32"
            title={b.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.logoUrl || "/placeholder/brand.svg"}
              alt={b.name}
              className="max-h-10 object-contain"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
