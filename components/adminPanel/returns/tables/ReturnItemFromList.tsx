"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { extractSizeFromTitle } from "@/helpers/extractSizeFromTitle";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReturnOffer } from "./ReturnItemsDisplay";

interface ReturnItemFromListProps {
  item: AllegroReturn["items"][number];
  className?: string;
  thumbnail?: string;
  signature?: string;
}

const reasonTranslations: Record<string, string> = {
  NONE: "Nie podano",
  MISTAKE: "Pomyłka",
  TRANSPORT: "Uszkodzenie w transporcie",
  DAMAGED: "Uszkodzone",
  NOT_AS_DESCRIBED: "Niezgodne z opisem",
  DONT_LIKE_IT: "Nie pasuje mi",
  OVERDUE_DELIVERY: "Opóźniona dostawa",
  INCOMPLETE: "Niekompletne",
  HIDDEN_FLAW: "Ukryta wada",
  OTHER_FLAW: "Inna wada",
  DIFFERENT: "Inne niż zamówione",
  COUNTERFEIT: "Podróbka",
};

export default function ReturnItemFromList({
  item,
  className,
  thumbnail,
  signature,
}: ReturnItemFromListProps) {
  const size = extractSizeFromTitle(item.name || "");

  return (
    <div
      className={cn("flex items-start gap-3 p-2 border rounded-md", className)}
    >
      <div className="w-12 h-12 bg-primary/25 rounded overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <a href={item.url}>
            <Image
              src={thumbnail}
              width={128}
              height={128}
              alt="Product"
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <ImageIcon className="w-full h-full p-2" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-sm">
          {signature ? signature : item.name}
          {size && (
            <span className="ml-2 text-xs bg-primary/25 px-2 py-1 rounded">
              {size}
            </span>
          )}
        </p>

        <div className="text-sm text-muted-foreground">
          Ilość: {item.quantity} × {item.price.amount} {item.price.currency}
        </div>

        {item.reason && (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium">Powód zwrotu:</span>{" "}
              <span className="px-2 py-1 rounded text-xs bg-secondary/50">
                {reasonTranslations[item.reason.type] || item.reason.type}
              </span>
            </div>
            {item.reason.userComment && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <span className="font-medium">Komentarz:</span>{" "}
                {item.reason.userComment}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
