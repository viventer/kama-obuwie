"use server";

import { adminStorage } from "@/firebase/firebaseAdmin";
import { ImageUrlSchema } from "@/firebase/schemas/otherSchemas";
import { cache } from "react";

export const getImageUrl = cache(async function (
  fileName: string,
  folderPath: string
): Promise<string | null> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(`${folderPath}/${fileName}`);
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
  folderPath: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucket = adminStorage.bucket();
  const filePath = `${folderPath}/${fileName}`;
  const fileRef = bucket.file(filePath);

  const buffer = Buffer.from(bufferString, "base64");

  await fileRef.save(buffer, {
    metadata: { contentType },
  });

  await fileRef.makePublic();

  return fileRef.publicUrl();
});

export const deleteImageFromStorage = cache(async function (
  fileName: string,
  folderPath: string
): Promise<void> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(`${folderPath}/${fileName}`);
  await fileRef.delete();
});
