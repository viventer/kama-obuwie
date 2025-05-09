"use client";

import { ColorVariant, RawPhoto } from "@/firebase/schemas/productsSchemas";
import MultipleImageUploader from "../global/MultipleImageUploader";
import { useEffect, useState } from "react";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
  folderPath,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[];
  folderPath: string;
}) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  useEffect(() => {
    console.log(fileNames);
  }, [fileNames]);

  return (
    <div>
      <MultipleImageUploader
        fileNames={fileNames}
        setFileNames={setFileNames}
        folderPath={folderPath}
      />
    </div>
  );
}
