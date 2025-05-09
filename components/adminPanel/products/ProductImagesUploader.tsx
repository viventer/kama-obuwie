"use client";

import { ColorVariant, RawPhoto } from "@/firebase/schemas/productsSchemas";
import MultipleImageUploader from "../global/MultipleImageUploader";
import { useState } from "react";
import { getColorVariantName } from "./helpers/productsHelpers";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
  folderPath,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[];
  folderPath: string;
}) {
  const colorVariantName = variant ? getColorVariantName(variant) : "";
  const filteredOldPhotos = oldPhotos.filter((photo) => {
    if (!colorVariantName) return true;
    return photo.colorVariantName === colorVariantName;
  });

  const oldFilePaths = filteredOldPhotos.map((photo) => photo.filePath);

  const [filePaths, setFilePaths] = useState<string[]>(oldFilePaths || []);

  return (
    <div>
      <MultipleImageUploader
        setFilePaths={setFilePaths}
        filePaths={filePaths}
        folderPath={folderPath}
      />
    </div>
  );
}
