"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage, formatFileSize } from "@/lib/media/image-utils";
import { useDocumentUploader } from "@/lib/media/uploadthing-upload";
import { Link as LinkIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploadFieldProps {
   value?: string | null;
   onChange: (url: string | null) => void;
   label?: string;
   disabled?: boolean;
}

export default function ImageUploadField({
   value,
   onChange,
   label = "Image",
   disabled = false,
}: ImageUploadFieldProps) {
   const [showUrlInput, setShowUrlInput] = useState(false);
   const [urlInput, setUrlInput] = useState("");
   const [isCompressing, setIsCompressing] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { startUpload, isUploading } = useDocumentUploader("categoryImage");

   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
         setIsCompressing(true);

         // Compress image if needed
         const compressedFile = await compressImage(file, { maxSizeKB: 500 });

         console.log(
            `Original: ${formatFileSize(file.size)}, Compressed: ${formatFileSize(
               compressedFile.size
            )}`
         );

         // Upload to UploadThing
         const result = await startUpload([compressedFile]);

         if (result && result[0]) {
            onChange(result[0].url);
         }
      } catch (error) {
         console.error("Image upload failed:", error);
         alert("Failed to upload image. Please try again.");
      } finally {
         setIsCompressing(false);
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   const handleUrlSubmit = () => {
      if (urlInput.trim()) {
         onChange(urlInput.trim());
         setUrlInput("");
         setShowUrlInput(false);
      }
   };

   const handleRemove = () => {
      onChange(null);
      setUrlInput("");
   };

   const isLoading = isUploading || isCompressing;

   return (
      <div className="space-y-2">
         <Label>{label}</Label>

         {value ? (
            <div className="space-y-2">
               <div className="relative w-full h-40 rounded-lg border overflow-hidden bg-gray-50">
                  <img
                     src={value}
                     alt="Category"
                     className="w-full h-full object-contain"
                  />
               </div>
               <div className="flex gap-2">
                  <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={handleRemove}
                     disabled={disabled}
                     className="flex-1"
                  >
                     <X className="h-4 w-4 mr-1" />
                     Remove
                  </Button>
                  <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={disabled || isLoading}
                     className="flex-1"
                  >
                     <Upload className="h-4 w-4 mr-1" />
                     Replace
                  </Button>
               </div>
            </div>
         ) : (
            <div className="space-y-2">
               {showUrlInput ? (
                  <div className="flex gap-2">
                     <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={disabled}
                     />
                     <Button
                        type="button"
                        size="sm"
                        onClick={handleUrlSubmit}
                        disabled={!urlInput.trim() || disabled}
                     >
                        Add
                     </Button>
                     <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                           setShowUrlInput(false);
                           setUrlInput("");
                        }}
                        disabled={disabled}
                     >
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
               ) : (
                  <div className="flex gap-2">
                     <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isLoading}
                     >
                        {isLoading ? (
                           <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isCompressing ? "Compressing..." : "Uploading..."}
                           </>
                        ) : (
                           <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                           </>
                        )}
                     </Button>
                     <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowUrlInput(true)}
                        disabled={disabled || isLoading}
                     >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Use URL
                     </Button>
                  </div>
               )}
               <p className="text-xs text-gray-500">
                  Max 500KB. Images will be automatically compressed.
               </p>
            </div>
         )}

         <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isLoading}
         />
      </div>
   );
}
