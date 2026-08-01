"use client";

import {
  ColorVariant,
  EditedPhoto,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";
import { Dispatch, useEffect, useState } from "react";
import { deleteRawPhoto } from "@/server-actions/files/files";
import { useParams } from "next/navigation";
import MultipleImageUploader from "../global/uploaders/MultipleImageUploader";
import { getColorVariantName } from "./helpers/productsHelpers";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
  folderPath,
  setNewPhotos,
  setIsUploading,
  showAiToggle = false,
  lockAiTogglesForExistingPhotos = false,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[] | EditedPhoto[];
  folderPath: string;
  setNewPhotos: Dispatch<React.SetStateAction<EditedPhoto[] | RawPhoto[]>>;
  setIsUploading?: (isUploading: boolean) => void;
  showAiToggle?: boolean;
  lockAiTogglesForExistingPhotos?: boolean;
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

  const [aiPaths, setAiPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const photo of filteredOldPhotos) {
      if ("isAiCoCreated" in photo && photo.isAiCoCreated) {
        initial.add(photo.filePath);
      }
    }
    return initial;
  });

  // Snapshot paths present when the page loaded — these are already on Allegro.
  const [lockedAiPaths] = useState<string[]>(() =>
    lockAiTogglesForExistingPhotos ? oldFilePaths : [],
  );

  const handleToggleAiCoCreated = (filePath: string) => {
    if (lockedAiPaths.includes(filePath)) return;
    setAiPaths((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  useEffect(() => {
    const uniquePaths = Array.from(new Set(filePaths));
    if (uniquePaths.length !== filePaths.length) {
      setFilePaths(uniquePaths);
      return;
    }

    const newPhotos: EditedPhoto[] = uniquePaths.map((filePath) => ({
      filePath,
      colorVariantName: colorVariantName || "",
      ...(showAiToggle && aiPaths.has(filePath)
        ? { isAiCoCreated: true }
        : {}),
    }));

    setNewPhotos((prev) => {
      const otherVariants = prev.filter(
        (photo) => photo.colorVariantName !== colorVariantName,
      );
      return [...otherVariants, ...newPhotos];
    });
  }, [filePaths, colorVariantName, setNewPhotos, aiPaths, showAiToggle]);

  return (
    <div className="mb-8">
      <MultipleImageUploader
        setFilePaths={setFilePaths}
        filePaths={filePaths}
        folderPath={folderPath}
        setIsUploading={setIsUploading}
        onImageDelete={async (filePath) => {
          await deleteRawPhoto(filePath, id);
          setAiPaths((prev) => {
            if (!prev.has(filePath)) return prev;
            const next = new Set(prev);
            next.delete(filePath);
            return next;
          });
        }}
        aiCoCreatedPaths={
          showAiToggle ? Array.from(aiPaths) : undefined
        }
        onToggleAiCoCreated={
          showAiToggle ? handleToggleAiCoCreated : undefined
        }
        lockedAiPaths={showAiToggle ? lockedAiPaths : undefined}
      />
    </div>
  );
}
