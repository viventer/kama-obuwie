"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { returnStatusTranslations } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReturnInfoDisplayProps {
  return: AllegroReturn;
  className?: string;
}

export function ReturnInfoDisplay({
  return: returnData,
  className,
}: ReturnInfoDisplayProps) {
  if (!returnData) {
    return;
  }

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
          {returnStatusTranslations[returnData.status] || returnData.status}
        </span>
      </div>
    </div>
  );
}
