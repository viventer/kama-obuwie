"use client";

import { ColorVariant, RawPhoto } from "@/firebase/schemas/productsSchemas";
import MultipleImageUploader from "../global/MultipleImageUploader";
import { Dispatch, useEffect, useState } from "react";
import { getColorVariantName } from "./helpers/productsHelpers";
import { deleteRawPhoto } from "@/server-actions/images/images";
import { useParams } from "next/navigation";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
  folderPath,
  setNewRawPhotos,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[];
  folderPath: string;
  setNewRawPhotos: Dispatch<React.SetStateAction<RawPhoto[]>>;
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
    const newPhotos: RawPhoto[] = filePaths.map((filePath) => ({
      filePath,
      colorVariantName: colorVariantName || "",
    }));
    setNewRawPhotos((prev) => {
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
