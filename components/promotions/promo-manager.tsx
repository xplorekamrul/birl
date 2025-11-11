"use client";

import { useAction } from "next-safe-action/hooks";
import { createPromotion } from "@/actions/promotions/create";
import { updatePromotion } from "@/actions/promotions/update";
import { deletePromotion } from "@/actions/promotions/delete";
import { togglePromotionActive } from "@/actions/promotions/toggle-active";
import { useState } from "react";

type Promo = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  buttonText: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  startDate: string | Date;
  endDate: string | Date;
  active: boolean;
  priority: number;
};

export default function PromoManager({ initialPromos }: { initialPromos: Promo[] }) {
  const [promos] = useState(initialPromos);

  // Hook the actions
  const createAct = useAction(createPromotion, {
    onSuccess: ({ data }) => {
      if (data?.ok) location.reload();
    },
  });

  const updateAct = useAction(updatePromotion, {
    onSuccess: ({ data }) => {
      if (data?.ok) location.reload();
    },
  });

  const deleteAct = useAction(deletePromotion, {
    onSuccess: ({ data }) => {
      if (data?.ok) location.reload();
    },
  });

  const toggleAct = useAction(togglePromotionActive, {
    onSuccess: ({ data }) => {
      if (data?.ok) location.reload();
    },
  });

  // ---- FormData adapters ----
  function fdString(fd: FormData, key: string) {
    const v = fd.get(key);
    return typeof v === "string" ? v : "";
  }
  function fdMaybeString(fd: FormData, key: string) {
    const v = fd.get(key);
    return typeof v === "string" ? v : undefined;
  }
  function fdBool(fd: FormData, key: string) {
    // checkbox sends "on" when checked; nothing when unchecked
    return fd.get(key) === "on";
  }
  function fdNumber(fd: FormData, key: string, fallback = 0) {
    const raw = fd.get(key);
    if (typeof raw !== "string" || raw.trim() === "") return fallback;
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
    }

  function fdDate(fd: FormData, key: string) {
    const raw = fd.get(key);
    // datetime-local returns "YYYY-MM-DDTHH:mm"
    const iso = typeof raw === "string" ? raw : "";
    return new Date(iso);
  }

  // ---- Form actions (FormData -> action input) ----
  const handleCreate = async (fd: FormData) => {
    await createAct.execute({
      title: fdString(fd, "title"),
      description: fdString(fd, "description"),
      image: fdString(fd, "image"),
      buttonText: fdString(fd, "buttonText"),
      link: fdString(fd, "link"),
      backgroundColor: fdString(fd, "backgroundColor"),
      textColor: fdString(fd, "textColor"),
      startDate: fdDate(fd, "startDate"),
      endDate: fdDate(fd, "endDate"),
      active: fdBool(fd, "active"),
      priority: fdNumber(fd, "priority", 0),
    });
  };

  const handleUpdate = async (fd: FormData) => {
    await updateAct.execute({
      id: fdString(fd, "id"),
      title: fdMaybeString(fd, "title") ?? "",
      description: fdMaybeString(fd, "description") ?? "",
      image: fdMaybeString(fd, "image") ?? "",
      buttonText: fdMaybeString(fd, "buttonText") ?? "",
      link: fdMaybeString(fd, "link") ?? "",
      backgroundColor: fdMaybeString(fd, "backgroundColor") ?? "",
      textColor: fdMaybeString(fd, "textColor") ?? "",
      startDate: fdDate(fd, "startDate"),
      endDate: fdDate(fd, "endDate"),
      active: fdBool(fd, "active"),
      priority: fdNumber(fd, "priority", 0),
    });
  };

  const handleDelete = async (fd: FormData) => {
    await deleteAct.execute({ id: fdString(fd, "id") });
  };

  const handleToggle = async (fd: FormData) => {
    await toggleAct.execute({
      id: fdString(fd, "id"),
      active: fdString(fd, "active") === "true",
    });
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Promotions</h1>

      {/* Create form */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-xl p-4"
        action={handleCreate}
      >
        <input name="title" placeholder="Title" className="border p-2 rounded" required />
        <input name="description" placeholder="Description" className="border p-2 rounded" required />
        <input name="image" placeholder="/offers/banner.jpg or https://..." className="border p-2 rounded" required />
        <input name="buttonText" placeholder="Button text" className="border p-2 rounded" required />
        <input name="link" placeholder="/shop?category=phones" className="border p-2 rounded" required />
        <input name="backgroundColor" placeholder="#0F172A" className="border p-2 rounded" required />
        <input name="textColor" placeholder="#FFFFFF" className="border p-2 rounded" required />
        <input name="startDate" type="datetime-local" className="border p-2 rounded" required />
        <input name="endDate" type="datetime-local" className="border p-2 rounded" required />
        <input name="priority" type="number" min={0} defaultValue={0} className="border p-2 rounded" />
        <label className="flex items-center gap-2">
          <input name="active" type="checkbox" defaultChecked />
          Active
        </label>
        <button className="col-span-full bg-black text-white rounded-lg py-2" type="submit">
          Create Promotion
        </button>
      </form>

      {/* List */}
      <div className="grid gap-4">
        {promos.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.title}</div>
              <div className="flex items-center gap-2">
                <form action={handleToggle}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="active" value={(!p.active).toString()} />
                  <button className="text-sm underline" type="submit">
                    {p.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form
                  action={handleDelete}
                  onSubmit={(e) => {
                    if (!confirm("Delete this promotion?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-sm text-red-600 underline" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <div className="text-sm text-gray-600">{p.description}</div>

            {/* Inline update */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-2" action={handleUpdate}>
              <input type="hidden" name="id" value={p.id} />
              <input name="title" defaultValue={p.title} className="border p-2 rounded" />
              <input name="description" defaultValue={p.description ?? ""} className="border p-2 rounded" />
              <input name="image" defaultValue={p.image} className="border p-2 rounded" />
              <input name="buttonText" defaultValue={p.buttonText} className="border p-2 rounded" />
              <input name="link" defaultValue={p.link} className="border p-2 rounded" />
              <input name="backgroundColor" defaultValue={p.backgroundColor} className="border p-2 rounded" />
              <input name="textColor" defaultValue={p.textColor} className="border p-2 rounded" />
              <input
                name="startDate"
                type="datetime-local"
                defaultValue={new Date(p.startDate).toISOString().slice(0, 16)}
                className="border p-2 rounded"
              />
              <input
                name="endDate"
                type="datetime-local"
                defaultValue={new Date(p.endDate).toISOString().slice(0, 16)}
                className="border p-2 rounded"
              />
              <input name="priority" type="number" defaultValue={Number(p.priority)} className="border p-2 rounded" />
              <label className="flex items-center gap-2">
                <input name="active" type="checkbox" defaultChecked={p.active} />
                Active
              </label>
              <button className="col-span-full bg-gray-900 text-white rounded py-2" type="submit">
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
