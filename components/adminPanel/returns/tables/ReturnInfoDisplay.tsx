"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { cn } from "@/lib/utils";

interface ReturnInfoDisplayProps {
  return: AllegroReturn;
  className?: string;
}

const statusTranslations: Record<string, string> = {
  CREATED: "Utworzony",
  DISPATCHED: "Wysłany",
  IN_TRANSIT: "W transporcie",
  DELIVERED: "Dostarczony",
  FINISHED: "Zakończony",
  FINISHED_APT: "Zakończony APT",
  REJECTED: "Odrzucony",
  COMMISSION_REFUND_CLAIMED: "Żądanie zwrotu prowizji",
  COMMISSION_REFUNDED: "Prowizja zwrócona",
  WAREHOUSE_DELIVERED: "Dostarczony do magazynu",
  WAREHOUSE_VERIFICATION: "Weryfikacja magazynowa",
};

export function ReturnInfoDisplay({
  return: returnData,
  className,
}: ReturnInfoDisplayProps) {
  const statusColor =
    returnData.status === "DELIVERED"
      ? "bg-accent/50"
      : returnData.status === "REJECTED"
      ? "bg-destructive/50"
      : returnData.status === "FINISHED" ||
        returnData.status === "FINISHED_APT" ||
        returnData.status.startsWith("COMMISSION")
      ? "bg-success/50"
      : "bg-secondary/50";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="font-medium text-sm">
        Data utworzenia:{" "}
        {new Date(returnData.createdAt).toLocaleDateString("pl-PL")}
      </div>
      <div className="text-sm">Nr zwrotu: {returnData.referenceNumber}</div>
      <div className="text-sm">
        Status:{" "}
        <span
          className={`ml-1 px-2 py-1 rounded text-xs font-medium ${statusColor}`}
        >
          {statusTranslations[returnData.status] || returnData.status}
        </span>
      </div>
    </div>
  );
}
