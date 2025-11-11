import type { ProductCardData } from "../product/ProductCard";
import ProductCard from "../product/ProductCard";
import ScrollButtons from "./ScrollButtons";

// simple slugify for an element id
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductCarousel({
  title,
  data,
  id,
}: {
  title: string;
  data: ProductCardData[];
  id?: string; // optional custom id
}) {
  if (!data?.length) return null;

  const elId = id ?? `carousel-${slugify(title)}`;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        {/* Client-only scroll controls */}
        <ScrollButtons targetId={elId} />
      </div>

      <div
        id={elId}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {data.map((p) => (
          <div key={p.id} className="min-w-[220px] max-w-[260px] snap-start">
            {/* ProductCard can be async Server Component */}
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
