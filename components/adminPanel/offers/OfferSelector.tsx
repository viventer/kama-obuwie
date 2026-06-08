"use client";

import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { DataTable } from "../global/data-table/DataTable";

export default function OfferSelector({
  availableOffers,
  setSelectedOfferId,
}: {
  availableOffers: OfferWithId[];
  setSelectedOfferId: (offerId: string) => void;
}) {
  const columnNames = [
    { attributeName: "title", displayName: "Tytuł" },
    { attributeName: "signature", displayName: "Sygnatura" },
    { attributeName: "SKU", displayName: "SKU" },
  ];

  return (
    <DataTable
      data={availableOffers}
      columnNames={columnNames}
      searchPlaceholder="Szukaj oferty"
      searchColumns={["title", "signature", "SKU"]}
      hasImages={true}
      imageAttribute="thumbnail"
      imageFolderPath={`offers/thumbnails`}
      maxSelectable={1}
      onSelectionChange={(rows) => {
        if (rows.length > 0) {
          setSelectedOfferId(rows[0].id);
        } else {
          setSelectedOfferId("");
        }
      }}
    />
  );
}
