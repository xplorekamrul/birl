"use client";

import Link from "next/link";

export type Offer = {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  startDate: string | Date;
  endDate: string | Date;
};

const defaultOffer: Offer = {
  id: "default",
  title: "Welcome to Birl Ecommerce",
  description: "Discover amazing products from trusted vendors. Shop now and enjoy great deals!",
  image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop",
  buttonText: "Shop Now",
  link: "/shop",
  backgroundColor: "#6366f1",
  textColor: "#ffffff",
  startDate: new Date(),
  endDate: new Date(),
};

export default function Hero({ data }: { data: Offer[] }) {
  const primary = data?.length ? data[0] : defaultOffer;

  // Debug print
  console.log("HERO IMAGE:", primary.image);

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: primary.backgroundColor }}
    >
      <div className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10">

        {/* TEXT */}
        <div className="space-y-4">
          <h1
            className="text-3xl md:text-5xl font-bold"
            style={{ color: primary.textColor }}
          >
            {primary.title}
          </h1>

          <p
            className="text-base md:text-lg opacity-90"
            style={{ color: primary.textColor }}
          >
            {primary.description}
          </p>

          <Link
            href={primary.link || "#"}
            className="inline-block rounded-xl px-5 py-3 font-medium bg-white text-black hover:opacity-90 transition"
          >
            {primary.buttonText || "Shop now"}
          </Link>
        </div>

        {/* IMAGE */}
        <div className="relative h-[220px] md:h-[300px] lg:h-[360px] rounded-xl overflow-hidden">
          {primary.image ? (
            <img
              src={primary.image}
              alt={primary.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
