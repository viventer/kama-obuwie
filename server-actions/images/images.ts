"use server";

import { adminStorage } from "@/firebase/firebaseAdmin";
import { ImageUrlSchema } from "@/firebase/schemas/otherSchemas";
import {
  EditedPhoto,
  ProductWithId,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";
import { getDocumentFromAdminDB } from "@/firebase/getters";

export const getImageUrl = async function (
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
};

export const getImagesUrls = async function (
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
};

export const uploadImageToStorage = async function (
  bufferString: string,
  filePath: string,
  contentType: string
): Promise<string> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);

  const buffer = Buffer.from(bufferString, "base64");

  await fileRef.save(buffer, {
    metadata: { contentType },
  });

  await fileRef.makePublic();

  return fileRef.publicUrl();
};

export type ImageFile = {
  base64: string;
  filePath: string;
  fileType: string;
};

export const uploadImagesToStorage = async function (
  images: ImageFile[]
): Promise<string[]> {
  await verifyUser(["ADMIN", "VERIFIED"]);

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
};

export const deleteImageFromStorage = async function (
  filePath: string
): Promise<void> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  await fileRef.delete();
};

export const deleteRawPhoto = async function (
  filePath: string,
  productId: string
): Promise<void> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  await fileRef.delete();

  const { data: productData, ref: productRef } =
    await getDocumentFromAdminDB<ProductWithId>("products", productId);

  if (!productData?.rawPhotos) return;

  const filteredPhotos = productData.rawPhotos.filter(
    (photo: RawPhoto) => photo.filePath !== filePath
  );
  productData.rawPhotos = filteredPhotos;
  await productRef.set(productData);
};

export const deleteUnusedPhotosFromStorage = async function (
  productId: string,
  storageEndpoint: "raw-photos" | "edited-photos"
): Promise<void> {
  await verifyUser(["ADMIN", "VERIFIED"]);

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
};

export const makeFilePublic = async function (filePath: string) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const bucket = adminStorage.bucket();
  const fileRef = bucket.file(filePath);
  await fileRef.makePublic();
};
