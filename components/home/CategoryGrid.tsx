import Link from "next/link";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function CategoryGrid({ data }: { data: Category[] }) {
  if (!data?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {data.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${encodeURIComponent(c.slug)}`}
            className="group rounded-2xl overflow-hidden border hover:shadow transition bg-white"
          >
            <div className="aspect-4/3 overflow-hidden">
              <img
                src={c.image || "/placeholder/cat.jpg"}
                alt={c.name}
                className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                loading="lazy"
              />
            </div>
            <div className="px-3 py-2 text-sm font-medium">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
