import { getHomeData } from "@/lib/home/home";

import BrandRail from "@/components/home/BrandRail";
import CategoryGrid from "@/components/home/CategoryGrid";
import Hero from "@/components/home/Hero";
import ProductCarousel from "@/components/home/ProductCarousel";
import VendorCards from "@/components/home/VendorCards";
import { mapProductsToCardData } from "@/lib/home/mappers";


export default async function HomePage() {
  const data = await getHomeData();

  const featuredForCards = mapProductsToCardData(data.featuredProducts);
  const dealsForCards = mapProductsToCardData(data.deals);

  return (
    <main className="max-w-6xl mx-auto space-y-10">
      <Hero data={data.offers} />

      <div className="space-y-10">
        <CategoryGrid data={data.categories} />
        <BrandRail data={data.brands} />
        <VendorCards data={data.vendors} />
        <ProductCarousel title="Featured" data={featuredForCards} />
        <ProductCarousel title="Deals" data={dealsForCards} />
      </div>
    </main>
  );
}