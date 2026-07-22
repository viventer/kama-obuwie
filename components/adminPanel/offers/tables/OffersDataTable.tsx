"use client";

import { TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useRouter } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { MoveRightIcon } from "lucide-react";
import { salesChannels } from "@/lib/constants";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import ChangeAvailabilityDialogContent from "../ChangeAvailabilityDialogContent";
import { useToast } from "@/hooks/useToast";
import ChangePricesDialogContent from "../ChangePricesDialogContent";
import {
  formatPLN,
  getLowestPrice30dReference,
  type PriceHistoryChannel,
} from "@/helpers/prices";

const isPriceHistoryChannel = (
  channel: string,
): channel is PriceHistoryChannel => channel === "DTC" || channel === "AL1";

const pricesEqual = (a: number, b: number): boolean => Math.abs(a - b) < 0.005;

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
      searchColumns={["signature", "title", "SKU"]}
      hasImages={true}
      imageAttribute="thumbnail"
      additionalContent={(row) => {
        if (!row?.sellingPrices) return;
        return (
          <>
            {salesChannels
              .filter((channel) => channel !== "POS")
              .map((salesChannel) => {
                const currentPriceStr = row.sellingPrices?.[salesChannel];
                if (!currentPriceStr) return null;

                const currentPrice = Number.parseFloat(currentPriceStr);
                const initialPriceStr =
                  row.initialSellingPrices?.[salesChannel];
                const initialPrice = initialPriceStr
                  ? Number.parseFloat(initialPriceStr)
                  : null;

                const lowestPrice30d = isPriceHistoryChannel(salesChannel)
                  ? getLowestPrice30dReference(row, salesChannel)
                  : null;

                // DTC/AL1: najniższa z 30 dni; AL2 (bez historii): fallback na cenę początkową
                const referencePrice =
                  lowestPrice30d ??
                  (Number.isFinite(initialPrice) ? initialPrice : null);

                const showReference =
                  referencePrice != null &&
                  Number.isFinite(currentPrice) &&
                  !pricesEqual(referencePrice, currentPrice);

                const showInitialNote =
                  isPriceHistoryChannel(salesChannel) &&
                  lowestPrice30d != null &&
                  initialPrice != null &&
                  Number.isFinite(initialPrice) &&
                  !pricesEqual(initialPrice, lowestPrice30d);

                return (
                  <section
                    key={salesChannel}
                    className="flex min-w-0 flex-col gap-0.5 mt-1"
                  >
                    <div className="flex min-w-0 flex-wrap gap-2 items-center">
                      <p className="font-medium">{salesChannel}</p>
                      {showReference && (
                        <>
                          <div className="bg-destructive/25 rounded-xs px-2 py-1 w-fit">
                            {formatPLN(referencePrice)}
                          </div>
                          <MoveRightIcon className="shrink-0" />
                        </>
                      )}
                      <div className="bg-primary/25 rounded-xs px-2 py-1 w-fit">
                        {formatPLN(currentPrice)}
                      </div>
                    </div>
                    {showInitialNote && (
                      <p className="text-xs text-muted-foreground truncate">
                        cena początkowa: {formatPLN(initialPrice)}
                      </p>
                    )}
                  </section>
                );
              })}

            <section className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-2 min-w-0">
              {Object.entries(row.availability).map(([size, availability]) => (
                <div
                  key={size}
                  className="bg-primary/25 rounded-xs px-2 py-1 min-w-0 truncate"
                >
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
