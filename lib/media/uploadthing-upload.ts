"use client";

import { useUploadThing } from "@/lib/media/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type EndpointName = keyof OurFileRouter & string;

export type UploadResult = {
  url: string;
  key: string;
  name: string;
};

/**
 * Common hook to use UploadThing for a specific endpoint.
 * Example: const { startUpload, isUploading } = useDocumentUploader("productImage");
 */
export function useDocumentUploader(endpoint: EndpointName) {
  const { startUpload, isUploading, routeConfig } = useUploadThing(endpoint);

  return {
    startUpload,
    isUploading,
    routeConfig,
  };
}
