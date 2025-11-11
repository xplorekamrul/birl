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

export default function Hero({ data }: { data: Offer[] }) {
  if (!data?.length) return null;
  const primary = data[0];

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: primary.backgroundColor }}
    >
      <div className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold" style={{ color: primary.textColor }}>
            {primary.title}
          </h1>
          <p className="text-base md:text-lg opacity-90" style={{ color: primary.textColor }}>
            {primary.description}
          </p>
          <Link
            href={primary.link || "#"}
            className="inline-block rounded-xl px-5 py-3 font-medium bg-white text-black hover:opacity-90 transition"
          >
            {primary.buttonText || "Shop now"}
          </Link>
        </div>
        {/* image */}
        <div className="relative h-[220px] md:h-[300px] lg:h-[360px] rounded-xl overflow-hidden">

          <img
            src={primary.image}
            alt={primary.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
