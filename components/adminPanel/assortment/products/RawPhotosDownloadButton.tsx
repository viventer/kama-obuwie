"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import React from "react";
import { useFullPageLoading } from "../../global/FullPageLoader";

export default function RawPhotosDownloadButton({
  params,
}: {
  params: { folderPath: string; downloadName: string };
}) {
  const { startLoading, stopLoading } = useFullPageLoading();

  const downloadPhotos = async () => {
    startLoading();
    try {
      const queryString = new URLSearchParams(params).toString();

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
      className="mb-8 px-4 py-2 text-foreground rounded"
      onClick={downloadPhotos}
    >
      Pobierz surowe zdjęcia (ZIP)
    </Button>
  );
}
