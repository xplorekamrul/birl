"use client";

import { deleteUploadthingFile } from "@/actions/media/delete-uploadthing-file";
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
import { compressImage, formatFileSize } from "@/lib/media/image-utils";
import { useDocumentUploader } from "@/lib/media/uploadthing-upload";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import {
  FileVideo,
  GripVertical,
  ImageIcon,
  Loader2,
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useDocumentUploader("productMedia");

  const currentUrl = form.watch(`media.${index}.url` as any);
  const currentType = form.watch(`media.${index}.type` as any);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);

      // Compress image if it's an image
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file, { maxSizeKB: 500 });
        console.log(
          `Original: ${formatFileSize(file.size)}, Compressed: ${formatFileSize(
            fileToUpload.size
          )}`
        );
      }

      // Upload to UploadThing
      const result = await startUpload([fileToUpload]);

      if (result && result[0]) {
        // Save the UploadThing URL to the form
        form.setValue(`media.${index}.url` as any, result[0].url);

        // Auto-detect type
        if (file.type.startsWith("video/")) {
          form.setValue(`media.${index}.type` as any, "VIDEO");
        } else {
          form.setValue(`media.${index}.type` as any, "IMAGE");
        }

        // Auto-generate alt text
        const altText = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ");
        form.setValue(`media.${index}.alt` as any, altText);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const handleRemove = async () => {
    // Delete from UploadThing if URL exists
    if (currentUrl && currentUrl.includes("utfs.io")) {
      try {
        await deleteUploadthingFile(currentUrl);
      } catch (error) {
        console.error("Failed to delete from UploadThing:", error);
      }
    }

    // Clear form values
    form.setValue(`media.${index}.url` as any, "");
    form.setValue(`media.${index}.alt` as any, "");
    onRemove(index);
  };

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
          onClick={() => handleRemove()}
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
              {currentUrl && !isUploading ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                  {currentType === "VIDEO" ? (
                    <video src={field.value} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={field.value} className="w-full h-full object-cover" alt="Product media" />
                  )}
                </div>
              ) : (
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploading) setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer
                    ${isDragOver ? "border-slate-700 bg-slate-100" : "border-slate-200 bg-slate-50"}
                    ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                      <span className="text-xs text-slate-500">Uploading...</span>
                    </div>
                  ) : (
                    <Upload className="h-5 w-5 text-slate-400" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={isUploading}
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
                <Input {...field} className="text-xs h-8" disabled={isUploading} />
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
              Add images and videos. First item is main image. Files are uploaded to secure cloud storage.
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
