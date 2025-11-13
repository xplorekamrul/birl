// src/lib/uploadthing.ts
"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Main hook + low-level helper (if you ever need it)
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
