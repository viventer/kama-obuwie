"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import React from "react";
import { useFullPageLoading } from "../../global/FullPageLoader";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getProductDownloadName, getProductFolderPath } from "@/helpers/files";
import { cn } from "@/lib/utils";

export default function PhotosDownloadButton({
  className,
  productType,
  manufacturerCode,
  productId,
  imagesType,
}: {
  className?: string;
  productType: ProductWithId["productType"];
  manufacturerCode: ProductWithId["manufacturerCode"];
  productId: ProductWithId["id"];
  imagesType: "raw" | "edited";
}) {
  const { startLoading, stopLoading } = useFullPageLoading();

  const folderPath = getProductFolderPath({
    type: productType,
    id: productId,
    imagesType,
  });

  const downloadName = getProductDownloadName({
    manufacturerCode,
    imagesType,
  });

  const downloadPhotos = async () => {
    startLoading();
    try {
      const queryString = new URLSearchParams({
        folderPath,
        downloadName,
      }).toString();

      const response = await axios.get(
        `/api/products/downloadPhotos?${queryString}`
      );
      const downloadUrl = response.data.downloadUrl;
      if (downloadUrl) {
        window.location.href = downloadUrl;
      } else {
        throw new Error("Brak URL do pobrania");
      }
    } catch (err) {
      console.error("Błąd podczas pobierania zdjęć:", err);
    } finally {
      stopLoading();
    }
  };

  return (
    <Button
      className={cn("px-4 py-2 text-foreground rounded", className)}
      onClick={downloadPhotos}
    >
      Pobierz {imagesType === "raw" ? "surowe" : "edytowane"} zdjęcia (ZIP)
    </Button>
  );
}
