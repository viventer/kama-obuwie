"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { generateAllegroCustomersCsv } from "@/server-actions/reports/allegroCustomers";
import { useFullPageLoading } from "../global/FullPageLoader";

export default function DownloadAllegroCustomersButton() {
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();

  const handleDownload = async () => {
    try {
      startLoading();
      const { csv, filename, count } = await generateAllegroCustomersCsv();

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      stopLoading();
      showToast(`Pobrano listę ${count} klientów Allegro.`, "success");
    } catch (err) {
      stopLoading();
      console.error("Error generating Allegro customers CSV:", err);
      showToast(
        err instanceof Error
          ? err.message
          : "Nie udało się wygenerować pliku CSV z klientami Allegro.",
        "error"
      );
    }
  };

  return (
    <Button onClick={handleDownload}>Pobierz listę klientów Allegro</Button>
  );
}
