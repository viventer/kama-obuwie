"use client";

import { TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useRouter } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { ArrowRightIcon, MoveRightIcon } from "lucide-react";
import { allegroSalesChannels } from "@/lib/constants";

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
      name: "Edytuj ofertę",
      onClick: (id) => {
        router.push(`/admin-panel/offers/${id}`);
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
          {allegroSalesChannels.map((salesChannel) => (
            <section
              key={salesChannel}
              className="flex gap-2 items-center mt-1"
            >
              <p className="font-medium">{salesChannel}</p>
              {row.initialSellingPrices[salesChannel] !==
                row.sellingPrices[salesChannel] && (
                <>
                  <div className="bg-destructive/25 rounded-sm px-2 py-1 w-fit">
                    {row.initialSellingPrices[salesChannel]} zł
                  </div>
                  <MoveRightIcon />
                </>
              )}
              <div className="bg-primary/25 rounded-sm px-2 py-1 w-fit">
                {row.sellingPrices[salesChannel]} zł
              </div>
            </section>
          ))}

          <h4 className="font-bold mt-2 mb-1">Dostępność:</h4>
          <section className="flex gap-2">
            {Object.entries(row.availability).map(([size, availability]) => (
              <div key={size} className="bg-primary/25 rounded-sm px-2 py-1">
                <span className="font-medium">{size}:</span>{" "}
                {availability.value}
              </div>
            ))}
          </section>
        </>
      )}
    />
  );
}
