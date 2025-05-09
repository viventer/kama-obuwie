"use server";

import { adminStorage } from "@/firebase/firebaseAdmin";
import { ImageUrlSchema } from "@/firebase/schemas/otherSchemas";
import { cache } from "react";

export const getImageUrl = cache(async function (
  filePath: string
): Promise<string | null> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  const imageUrl = fileRef.publicUrl();

  try {
    ImageUrlSchema.parse(imageUrl);
  } catch (err) {
    return null;
  }

  return imageUrl;
});

export const uploadImageToStorage = cache(async function (
  bufferString: string,
  filePath: string,
  contentType: string
): Promise<string> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);

  const buffer = Buffer.from(bufferString, "base64");

  await fileRef.save(buffer, {
    metadata: { contentType },
  });

  await fileRef.makePublic();

  return fileRef.publicUrl();
});

export type ImageFile = {
  base64: string;
  filePath: string;
  fileType: string;
};

export const uploadImagesToStorage = cache(async function (
  images: ImageFile[]
): Promise<string[]> {
  const bucket = adminStorage.bucket();

  const uploadPromises = images.map(async ({ base64, filePath, fileType }) => {
    const fileRef = bucket.file(filePath);
    const buffer = Buffer.from(base64, "base64");

    await fileRef.save(buffer, {
      metadata: { contentType: fileType },
    });

    await fileRef.makePublic();

    return fileRef.publicUrl();
  });

  const urls = await Promise.all(uploadPromises);
  return urls;
});

export const deleteImageFromStorage = cache(async function (
  filePath: string
): Promise<void> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  await fileRef.delete();
});
