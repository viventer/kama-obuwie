"use client";

import {
  ColorVariant,
  EditedPhoto,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";
import { Dispatch, useEffect, useState } from "react";
import { deleteRawPhoto } from "@/server-actions/images/images";
import { useParams } from "next/navigation";
import MultipleImageUploader from "../global/uploaders/MultipleImageUploader";
import { getColorVariantName } from "./helpers/productsHelpers";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
  folderPath,
  setNewPhotos,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[] | EditedPhoto[];
  folderPath: string;
  setNewPhotos: Dispatch<React.SetStateAction<RawPhoto[]>>;
}) {
  const params = useParams();
  const { id } = params as { id: string };

  const colorVariantName = variant ? getColorVariantName(variant) : "";
  const filteredOldPhotos = oldPhotos.filter((photo) => {
    if (!colorVariantName) return true;
    return photo.colorVariantName === colorVariantName;
  });

  const oldFilePaths = filteredOldPhotos.map((photo) => photo.filePath);

  const [filePaths, setFilePaths] = useState<string[]>(oldFilePaths || []);

  useEffect(() => {
    const newPhotos: RawPhoto[] | EditedPhoto[] = filePaths.map((filePath) => ({
      filePath,
      colorVariantName: colorVariantName || "",
    }));
    setNewPhotos((prev) => {
      const filteredOldPhotos = prev.filter((photo) => {
        if (!colorVariantName) return true;
        return photo.colorVariantName !== colorVariantName;
      });
      return [...filteredOldPhotos, ...newPhotos];
    });
  }, [filePaths]);

  return (
    <div className="mb-8">
      <MultipleImageUploader
        setFilePaths={setFilePaths}
        filePaths={filePaths}
        folderPath={folderPath}
        onImageDelete={async (filePath) => {
          await deleteRawPhoto(filePath, id);
        }}
      />
    </div>
  );
}
