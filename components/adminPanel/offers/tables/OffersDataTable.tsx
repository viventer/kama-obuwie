"use client";

import { TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useRouter } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export default function OffersDataTable({
  data,
}: {
  data: OfferWithId[] | null;
}) {
  const router = useRouter();

  const columnNames = [
    { attributeName: "signature", displayName: "Sygnatura" },
    { attributeName: "title", displayName: "Tytuł" },
    { attributeName: "SKU", displayName: "SKU" },
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
      data={data || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["signature", "title"]}
      hasImages={true}
      imageAttribute="thumbnail"
      imageValueType="url"
      additionalContent={(row) => (
        <>
          <h4 className="font-bold">Ceny sprzedaży:</h4>
          <div className="flex">
            <p className="border-r-1 pr-2">AL1: {row.sellingPrices.AL1}</p>
            <p className="pl-2">AL2: {row.sellingPrices.AL2}</p>
          </div>
          <h4 className="font-bold">Ceny początkowe:</h4>
          <div className="flex">
            <p className="border-r-1 pr-2">
              AL1: {row.initialSellingPrices.AL1}
            </p>
            <p className="pl-2">AL2: {row.initialSellingPrices.AL2}</p>
          </div>
        </>
      )}
    />
  );
}
