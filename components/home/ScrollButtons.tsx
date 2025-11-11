"use client";

export default function ScrollButtons({ targetId }: { targetId: string }) {
  const scrollBy = (delta: number) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => scrollBy(-320)}
        className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
        aria-label="Scroll left"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollBy(320)}
        className="h-9 w-9 rounded-full border bg-white hover:bg-gray-50"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}
