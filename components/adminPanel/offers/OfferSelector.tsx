"use client";

import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { DataTable } from "../global/data-table/DataTable";

export default function OfferSelector({
  offers,
  setSelectedOfferId,
}: {
  offers: OfferWithId[];
  setSelectedOfferId: (offerId: string) => void;
}) {
  const columnNames = [
    { attributeName: "signature", displayName: "Sygnatura" },
    { attributeName: "title", displayName: "Tytuł" },
    { attributeName: "SKU", displayName: "SKU" },
  ];

  return (
    <DataTable
      data={offers}
      columnNames={columnNames}
      hasImages={true}
      imageAttribute="thumbnail"
      searchPlaceholder="Szukaj ofert"
      searchColumns={["signature", "title"]}
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
