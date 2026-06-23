"use client";

import { TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useRouter } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { MoveRightIcon } from "lucide-react";
import { allegroSalesChannels, salesChannels } from "@/lib/constants";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import ChangeAvailabilityDialogContent from "../ChangeAvailabilityDialogContent";
import { useToast } from "@/hooks/useToast";
import ChangePricesDialogContent from "../ChangePricesDialogContent";

export default function OffersDataTable({
  data,
}: {
  data: OfferWithId[] | null;
}) {
  const router = useRouter();
  const { openDialog } = useDialogWindow();
  const { showToast } = useToast();

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
    {
      name: "Zmień dostępność",
      onClick: (id) => {
        const offer = data?.find((offer) => offer.id === id);
        if (!offer || !offer.availability) {
          showToast(
            "Nie można zmienić dostępności: brak danych oferty.",
            "error",
          );
          return;
        }

        openDialog({
          title: "Zmień dostępność",
          content: (
            <ChangeAvailabilityDialogContent
              offerId={id!}
              availability={offer.availability!}
              allegroOffersIds={offer.allegroOffersIds}
              isAddedToMerchantCenter={offer?.isAddedToMerchantCenter || false}
            />
          ),
          hasCancelButton: false,
        });
      },
    },
    {
      name: "Zmień ceny",
      onClick: (id) => {
        const offer = data?.find((offer) => offer.id === id);
        if (!offer || !offer.sellingPrices) {
          showToast("Nie można zmienić cen: brak danych oferty.", "error");
          return;
        }

        openDialog({
          title: "Zmień ceny sprzedaży",
          content: <ChangePricesDialogContent offerData={offer} />,
          hasCancelButton: false,
        });
      },
    },
    {
      name: "Zobacz dane produktu",
      onClick: (id) => {
        const offer = data?.find((offer) => offer.id === id);
        if (!offer) {
          showToast(
            "Nie można wyświetlić danych produktu: brak danych oferty.",
            "error",
          );
          return;
        }

        if (!offer.productId) {
          showToast(
            "Nie można wyświetlić danych produktu: oferta nie jest powiązana z produktem.",
            "error",
          );
          return;
        }

        router.push(
          `/admin-panel/create-products/product-data/${offer.productId}`,
        );
      },
    },
    {
      name: "Edytuj wielowariant",
      onClick: (id) => {
        const offer = data?.find((offer) => offer.id === id);
        if (!offer) {
          showToast("Nie można edytować wariantów oferty.", "error");
          return;
        }

        router.push(`/admin-panel/offers/multivariants/${offer.id}`);
      },
    },
  ];

  return (
    <DataTable
      data={data || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj ofert"
      searchColumns={[
        "signature",
        "title",
        "SKU",
        "id",
        "productId",
        "legacyProductId",
      ]}
      hasImages={true}
      imageAttribute="thumbnail"
      additionalContent={(row) => {
        if (!row?.sellingPrices) return;
        return (
          <>
            {salesChannels
              .filter((channel) => channel !== "POS")
              .map((salesChannel) => (
                <section
                  key={salesChannel}
                  className="flex gap-2 items-center mt-1"
                >
                  <p className="font-medium">{salesChannel}</p>
                  {row.initialSellingPrices?.[salesChannel] &&
                    row.initialSellingPrices[salesChannel] !==
                      row.sellingPrices[salesChannel] && (
                      <>
                        <div className="bg-destructive/25 rounded-xs px-2 py-1 w-fit">
                          {row.initialSellingPrices[salesChannel]} zł
                        </div>
                        <MoveRightIcon />
                      </>
                    )}
                  <div className="bg-primary/25 rounded-xs px-2 py-1 w-fit">
                    {row.sellingPrices?.[salesChannel]} zł
                  </div>
                </section>
              ))}

            <section className="flex gap-2 mt-2">
              {Object.entries(row.availability).map(([size, availability]) => (
                <div key={size} className="bg-primary/25 rounded-xs px-2 py-1">
                  <span className="font-medium">{size}:</span>{" "}
                  {availability.value}
                </div>
              ))}
            </section>
          </>
        );
      }}
    />
  );
}
