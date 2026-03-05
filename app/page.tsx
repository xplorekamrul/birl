import { getHomeData } from "@/lib/home/home";
import { Suspense } from "react";

import BrandRail from "@/components/home/BrandRail";
import CategoryGrid from "@/components/home/CategoryGrid";
import Hero from "@/components/home/Hero";
import ProductCarousel from "@/components/home/ProductCarousel";
import VendorCards from "@/components/home/VendorCards";
import Loading from "./loading";

async function HomeContent() {
  const data = await getHomeData();

  return (
    <>
      <Hero data={data.offers} />

      <div className="space-y-10">
        <CategoryGrid data={data.categories} />
        <BrandRail data={data.brands} />
        <VendorCards data={data.vendors} />
        <ProductCarousel title="Featured" data={data.featuredProducts} />
        <ProductCarousel title="Deals" data={data.deals} />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto space-y-10">
      <Suspense fallback={<Loading />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}