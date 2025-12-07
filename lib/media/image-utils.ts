"use client";

/**
 * Client-side image compression utility
 * Compresses images to a target size (default 500KB) while maintaining quality
 */

export interface CompressImageOptions {
   maxSizeKB?: number;
   maxWidth?: number;
   maxHeight?: number;
   quality?: number;
}

export async function compressImage(
   file: File,
   options: CompressImageOptions = {}
): Promise<File> {
   const {
      maxSizeKB = 500,
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.9,
   } = options;

   // If file is already small enough, return as is
   if (file.size <= maxSizeKB * 1024) {
      return file;
   }

   return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
         const img = new Image();

         img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
               const ratio = Math.min(maxWidth / width, maxHeight / height);
               width *= ratio;
               height *= ratio;
            }

            // Create canvas and draw resized image
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
               reject(new Error("Failed to get canvas context"));
               return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels to get under target size
            let currentQuality = quality;
            const tryCompress = () => {
               canvas.toBlob(
                  (blob) => {
                     if (!blob) {
                        reject(new Error("Failed to compress image"));
                        return;
                     }

                     // If still too large and quality can be reduced, try again
                     if (blob.size > maxSizeKB * 1024 && currentQuality > 0.1) {
                        currentQuality -= 0.1;
                        tryCompress();
                        return;
                     }

                     // Create new file from blob
                     const compressedFile = new File([blob], file.name, {
                        type: file.type || "image/jpeg",
                        lastModified: Date.now(),
                     });

                     resolve(compressedFile);
                  },
                  file.type || "image/jpeg",
                  currentQuality
               );
            };

            tryCompress();
         };

         img.onerror = () => reject(new Error("Failed to load image"));
         img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
   });
}

export function formatFileSize(bytes: number): string {
   if (bytes === 0) return "0 Bytes";
   const k = 1024;
   const sizes = ["Bytes", "KB", "MB"];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
