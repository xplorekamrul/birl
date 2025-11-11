import Link from "next/link";

export type Vendor = {
  id: string;
  shopName: string;
  shopSlug: string;
  shopLogo?: string | null;
  averageRating: number;
  totalOrders: number;
};

export default function VendorCards({ data }: { data: Vendor[] }) {
  if (!data?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold">Featured Shops</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((v) => (
          <Link
            key={v.id}
            href={`/shop/${encodeURIComponent(v.shopSlug)}`}
            className="rounded-2xl border bg-white hover:shadow transition p-4 flex flex-col items-center text-center"
          >
            <div className="h-16 w-16 rounded-full overflow-hidden border mb-3 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.shopLogo || "/placeholder/vendor.png"}
                alt={v.shopName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="text-sm font-medium">{v.shopName}</div>
            <div className="text-xs text-gray-500">
              ⭐ {v.averageRating.toFixed(1)} · {v.totalOrders} orders
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
