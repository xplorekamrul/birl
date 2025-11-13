import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Endpoint: "productImage"
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      // TODO: plug in real auth/session if needed
      // const session = await auth();
      // if (!session) throw new Error("Unauthorized");

      return {
        userId: "demo-user-id", // replace with real user id
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs on UploadThing infra (not in your Next.js process)
      console.log("Upload complete:", {
        userId: metadata.userId,
        url: file.url,
        key: file.key,
        name: file.name,
      });

      // Optional: you could notify your app, webhook, etc.
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
