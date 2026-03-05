"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import {
  FileVideo,
  GripVertical,
  ImageIcon,
  Link2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

type Props = {
  form: UseFormReturn<ProductComprehensiveValues>;
};

type MediaCardProps = {
  index: number;
  field: any;
  control: any;
  onRemove: (index: number) => void;
  isOnly: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDraggingOver: boolean;
  isDragging: boolean;
  form: UseFormReturn<ProductComprehensiveValues>;
};

function MediaCard({
  index,
  field,
  control,
  onRemove,
  isOnly,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggingOver,
  isDragging,
  form,
}: MediaCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = form.watch(`media.${index}.url` as any);
  const currentType = form.watch(`media.${index}.type` as any);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    form.setValue(`media.${index}.url` as any, url);

    const altText = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ");
    form.setValue(`media.${index}.alt` as any, altText);

    if (file.type.startsWith("video/")) {
      form.setValue(`media.${index}.type` as any, "VIDEO");
    } else {
      form.setValue(`media.${index}.type` as any, "IMAGE");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [index]
  );

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`relative rounded-xl border-2 bg-white overflow-hidden transition cursor-grab
        ${isDraggingOver ? "border-slate-700 shadow-lg scale-[1.02]" : "border-slate-200"}
        ${isDragging ? "opacity-40 scale-95" : ""}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-0 left-2 z-10 cursor-grab p-1">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>

      {!isOnly && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border"
        >
          <X className="h-3.5 w-3.5 text-slate-500 hover:text-red-500" />
        </button>
      )}

      <div className="p-1 pt-5 space-y-1">
        <FormField
          control={control}
          name={`media.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || "IMAGE"}>
                <FormControl>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IMAGE">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5" /> Image
                    </span>
                  </SelectItem>
                  <SelectItem value="VIDEO">
                    <span className="flex items-center gap-2">
                      <FileVideo className="h-3.5 w-3.5" /> Video
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`media.${index}.url`}
          render={({ field }) => (
            <FormItem>
              {currentUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                  {currentType === "VIDEO" ? (
                    <video src={field.value} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={field.value} className="w-full h-full object-cover" />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer
                    ${isDragOver ? "border-slate-700 bg-slate-100" : "border-slate-200 bg-slate-50"}
                  `}
                >
                  <Upload className="h-5 w-5 text-slate-400" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`media.${index}.alt`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-slate-500">Alt text</FormLabel>
              <FormControl>
                <Input {...field} className="text-xs h-8" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default function MediaTab({ form }: Props) {
  const control = (form as any).control;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "media",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ url: "", type: "IMAGE", alt: "", sortOrder: 0 });
    }
  }, []);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addMedia = () => {
    append({
      url: "",
      type: "IMAGE",
      alt: "",
      sortOrder: fields.length,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        {/* ✅ Header with right-side Add Button */}
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Product Media</CardTitle>
            <CardDescription>
              Add images and videos. First item is main image.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={addMedia}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Media
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {fields.map((field, index) => (
              <MediaCard
                key={field.id}
                index={index}
                field={field}
                control={control}
                form={form}
                onRemove={remove}
                isOnly={fields.length === 1}
                onDragStart={(i) => setDraggingIndex(i)}
                onDragOver={(e, i) => {
                  e.preventDefault();
                  setDragOverIndex(i);
                }}
                onDrop={(e, dropIndex) => {
                  e.preventDefault();
                  if (draggingIndex !== null && draggingIndex !== dropIndex) {
                    move(draggingIndex, dropIndex);
                  }
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                isDragging={draggingIndex === index}
                isDraggingOver={dragOverIndex === index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}