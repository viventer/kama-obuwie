"use server";

import { adminStorage } from "@/firebase/firebaseAdmin";
import { ImageUrlSchema } from "@/firebase/schemas/otherSchemas";
import { cache } from "react";
import { getDocumentFromAdminDB } from "../helpers";
import {
  EditedPhoto,
  ProductWithId,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";

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

export const getImagesUrls = cache(async function (
  filePaths: string[]
): Promise<string[] | null> {
  const bucket = adminStorage.bucket();
  const urls: string[] = [];

  for (const filePath of filePaths) {
    const fileRef = bucket.file(filePath);
    const imageUrl = fileRef.publicUrl();

    try {
      ImageUrlSchema.parse(imageUrl);
      urls.push(imageUrl);
    } catch (err) {
      return null;
    }
  }

  return urls;
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

export const deleteRawPhoto = cache(async function (
  filePath: string,
  productId: string
): Promise<void> {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  await fileRef.delete();

  const { data: productData, ref: productRef } =
    await getDocumentFromAdminDB<ProductWithId>("products", productId);

  if (!productData?.rawPhotos) return;

  const filteredPhotos = productData.rawPhotos.filter(
    (photo) => photo.filePath !== filePath
  );
  productData.rawPhotos = filteredPhotos;
  await productRef.set(productData);
});

export const deleteUnusedPhotosFromStorage = cache(async function (
  productId: string,
  storageEndpoint: "raw-photos" | "edited-photos"
): Promise<void> {
  const bucket = adminStorage.bucket();

  const { data: productData, ref: productRef } =
    await getDocumentFromAdminDB<ProductWithId>("products", productId);

  let photosPaths: string[] = [];
  if (storageEndpoint === "raw-photos") {
    photosPaths =
      productData?.rawPhotos?.map((photo: RawPhoto) => photo.filePath) || [];
  } else if (storageEndpoint === "edited-photos") {
    photosPaths =
      productData?.editedPhotos?.map((photo: EditedPhoto) => photo.filePath) ||
      [];
  }

  const prefix = `products/${storageEndpoint}/${
    productData?.productType || "obuwie"
  }/${productId}/`;

  const [files] = await bucket.getFiles({ prefix });

  const unusedFiles = files.filter((file) => !photosPaths.includes(file.name));

  await Promise.all(unusedFiles.map((file) => file.delete()));
});

export const makeFilePublic = cache(async function (filePath: string) {
  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  fileRef.makePublic();
});
