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
  setIsUploading,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[] | EditedPhoto[];
  folderPath: string;
  setNewPhotos: Dispatch<React.SetStateAction<RawPhoto[]>>;
  setIsUploading?: (isUploading: boolean) => void;
}) {
  const params = useParams();
  const { id } = params as { id: string };

  const colorVariantName = variant ? getColorVariantName(variant) : "";

  const filteredOldPhotos = oldPhotos.filter((photo) => {
    if (!colorVariantName) return true;
    return photo.colorVariantName === colorVariantName;
  });

  const oldFilePaths = filteredOldPhotos.map((photo) => photo.filePath);
  const [filePaths, setFilePaths] = useState<string[]>(oldFilePaths);

  useEffect(() => {
    const uniquePaths = Array.from(new Set(filePaths));
    if (uniquePaths.length !== filePaths.length) {
      setFilePaths(uniquePaths);
      return;
    }

    const newPhotos: RawPhoto[] = uniquePaths.map((filePath) => ({
      filePath,
      colorVariantName: colorVariantName || "",
    }));

    setNewPhotos((prev) => {
      const otherVariants = prev.filter(
        (photo) => photo.colorVariantName !== colorVariantName
      );
      return [...otherVariants, ...newPhotos];
    });
  }, [filePaths, colorVariantName, setNewPhotos]);

  return (
    <div className="mb-8">
      <MultipleImageUploader
        setFilePaths={setFilePaths}
        filePaths={filePaths}
        folderPath={folderPath}
        setIsUploading={setIsUploading}
        onImageDelete={async (filePath) => {
          await deleteRawPhoto(filePath, id);
        }}
      />
    </div>
  );
}
