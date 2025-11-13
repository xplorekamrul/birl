"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { X, Star, GripVertical, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
  alt?: string;
  isPrimary?: boolean;
};

type Props = {
  value: LocalImage[];
  onChange: (images: LocalImage[]) => void;
};

export default function ImagesSection({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const resetInputValue = () => {
    // allow selecting the same file(s) twice
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const mapped: LocalImage[] = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: false,
      }));
      onChange([...(value ?? []), ...mapped]);
      resetInputValue();
    },
    [onChange, value],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      onFiles(event.dataTransfer.files);
    },
    [onFiles],
  );

  const removeAt = (index: number) => {
    const next = [...value];
    const [removed] = next.splice(index, 1);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(next);
  };

  const setPrimary = (index: number) => {
    const next = value.map((img, i) => ({ ...img, isPrimary: i === index }));
    onChange(next);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (event: React.DragEvent, overIndex: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === overIndex) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    setDragIndex(overIndex);
    onChange(next);
  };

  const handleDragEnd = () => setDragIndex(null);

  const primaryIdx = useMemo(
    () => value.findIndex((v) => v.isPrimary) ?? -1,
    [value],
  );

  return (
    <section className="rounded-2xl border p-5 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Images</h3>
          <p className="text-sm text-muted-foreground">
            Upload, reorder, and choose a primary image. Drag & drop supported.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={openPicker}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Add images
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => onFiles(event.target.files)}
      />

      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        // Only open the picker on click when there are NO images (empty state)
        onClick={value.length === 0 ? openPicker : undefined}
        role={value.length === 0 ? "button" : undefined}
        tabIndex={value.length === 0 ? 0 : -1}
        onKeyDown={
          value.length === 0
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openPicker();
                }
              }
            : undefined
        }
        className={cn(
          "mt-4 flex min-h-[140px] w-full items-center justify-center rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground",
          value.length === 0 && "bg-muted/30 cursor-pointer",
        )}
      >
        {value.length === 0 ? (
          <div className="text-center">
            <p>
              Drag files here or{" "}
              <button
                type="button"
                className="underline"
                onClick={(event) => {
                  event.stopPropagation();
                  openPicker();
                }}
              >
                browse
              </button>
            </p>
            <p className="mt-1">
              JPEG, PNG, WEBP (max ~10MB each recommended)
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {value.map((img, index) => (
                <li
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-white shadow-sm",
                  )}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.alt ?? `image-${index}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>

                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPrimary(index);
                      }}
                      className={cn(
                        "rounded-full p-2 shadow bg-white/90 hover:bg-white",
                        img.isPrimary && "ring-2 ring-yellow-500",
                      )}
                      title="Set primary"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          img.isPrimary ? "fill-yellow-500" : "fill-none",
                        )}
                      />
                    </button>
                  </div>

                  <div className="absolute right-2 top-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeAt(index);
                      }}
                      className="rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 p-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Alt text (optional)"
                      value={img.alt ?? ""}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        const next = [...value];
                        next[index] = { ...img, alt: event.target.value };
                        onChange(next);
                      }}
                      className="h-8"
                    />
                  </div>

                  {img.isPrimary && (
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                      Primary
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>

      {value.length > 0 && (
        <>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Tip: The first image becomes the primary in the database
            (sortOrder = 0). You can change which is primary by clicking the
            star.
          </p>
        </>
      )}
    </section>
  );
}
