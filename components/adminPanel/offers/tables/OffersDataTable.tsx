"use client";

import { TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export default function OffersDataTable({
  data,
}: {
  data: OfferWithId[] | null;
}) {
  const [filteredData, setFilteredData] = useState<OfferWithId[] | null>(null);
  const router = useRouter();

  const columnNames = [
    { attributeName: "signature", displayName: "Sygnatura" },
    { attributeName: "title", displayName: "Tytuł" },
    { attributeName: "suggestedPrice", displayName: "Cena sugerowana" },
    { attributeName: "colorVariantName", displayName: "Kolor" },
  ];

  const actions: TableAction[] = [
    {
      name: "Zobacz dane",
      onClick: (id) => {
        window.open(
          `/admin-panel/create-products/product-data/${id}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
    },
    {
      name: "Edytuj parametry",
      onClick: (id) => {
        router.push(`/admin-panel/products/parameters/${id}`);
      },
    },
    {
      name: "Edytuj zdjęcia",
      onClick: (id) => {
        router.push(`/admin-panel/products/images/${id}`);
      },
    },
    {
      name: "Edytuj opis",
      onClick: (id) => {
        router.push(`/admin-panel/products/description/${id}`);
      },
    },
  ];

  return (
    <DataTable
      data={filteredData || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["signature", "title"]}
      hasImages={true}
      imageAttribute="thumbnail"
      imageFolderPath="offers"
    />
  );
}
