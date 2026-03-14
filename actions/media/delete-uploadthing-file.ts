"use server";

import { auth } from "@/lib/auth";

/**
 * Delete a file from UploadThing
 * Extracts the file key from the UploadThing URL and deletes it
 */
export async function deleteUploadthingFile(fileUrl: string) {
   try {
      const session = await auth();
      if (!session?.user) {
         return { ok: false, message: "Unauthorized" };
      }

      // Extract file key from UploadThing URL
      // URL format: https://utfs.io/f/{fileKey}
      const match = fileUrl.match(/utfs\.io\/f\/([a-zA-Z0-9]+)/);
      if (!match || !match[1]) {
         return { ok: false, message: "Invalid UploadThing URL" };
      }

      const fileKey = match[1];

      // Call UploadThing API to delete the file
      const response = await fetch("https://api.uploadthing.com/deleteFile", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.UPLOADTHING_SECRET}`,
         },
         body: JSON.stringify({
            fileKey,
         }),
      });

      if (!response.ok) {
         console.error("UploadThing delete error:", await response.text());
         return { ok: false, message: "Failed to delete file from storage" };
      }

      return { ok: true, message: "File deleted successfully" };
   } catch (error) {
      console.error("Delete file error:", error);
      return {
         ok: false,
         message: error instanceof Error ? error.message : "Failed to delete file",
      };
   }
}
