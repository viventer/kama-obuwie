"use client";

import { Product, ProductWithId } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../../global/data-table/DataTable";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useEffect, useState } from "react";
import { Offer } from "@/firebase/schemas/offersSchemas";

export default function CreateProductsPostOfferDataTable({
  data,
}: {
  data: ProductWithId[] | null;
}) {
  const { productType } = useProductTypeContext();
  const [filteredData, setFilteredData] = useState<ProductWithId[] | null>(
    null
  );

  const elementaryColumnNames = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "purchasePrice", displayName: "Cena zakupu" },
  ];
  const shoesProductColumnNames = [
    ...elementaryColumnNames,
    { attributeName: "colorVariants", displayName: "Warianty" },
  ];
  const [columnNames, setColumnNames] = useState<ColumnName<ProductWithId>[]>(
    elementaryColumnNames
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const newData = data.filter(
      (product) => product.productType === productType
    );
    setFilteredData(newData);

    if (
      productType === "obuwie" &&
      columnNames.length !== shoesProductColumnNames.length
    ) {
      setColumnNames(shoesProductColumnNames);
    } else if (productType === "akcesoria") {
      setColumnNames(elementaryColumnNames);
    }
  }, [data, productType]);

  const router = useRouter();
  const { showToast } = useToast();

  const handleCreateOffer = async (productId: string) => {
    try {
      const getOfferResponse = await axios.get(
        "/api/offers?productId=" + productId
      );
      const data: Offer = Object.values(getOfferResponse.data)[0] as Offer;
      const offerId = data?.id;
      if (offerId) {
        router.push("/admin-panel/offers/create/" + offerId);
        return;
      }
      const createOfferResponse = await axios.post("/api/offers", {
        productId: productId,
      });
      if (createOfferResponse.status === 201) {
        const newOfferId = createOfferResponse.data.id;
        router.push("/admin-panel/offers/create/" + newOfferId);
        showToast("Szkic oferty został utworzony.", "success");
      } else {
        showToast(
          `Nie można utworzyć szkicu oferty. Błąd: ${createOfferResponse.data}`,
          "error"
        );
        return;
      }
    } catch (err) {
      showToast(`Nie można wystawić oferty: ${err}`, "error");
      return;
    }
  };

  const actions: TableAction[] = [
    {
      name: "Wystaw ofertę",
      onClick: async (id) => {
        await handleCreateOffer(id as string);
      },
    },
    {
      name: "Cofnij do poprzedniego etapu",
      onClick: async (id) => {
        try {
          const updateData: Partial<Product> = {
            creationStage: "description",
          };
          await axios.patch(`/api/products/${id}`, updateData);
          showToast(
            "Produkt został przeniesiony do poprzedniego etapu.",
            "success"
          );
          router.refresh();
          setFilteredData(filteredData);
        } catch (err) {
          showToast(`Nie można przenieść produktu: ${err}`, "error");
        }
      },
    },
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
  ];

  return (
    <DataTable
      data={filteredData || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["brand", "manufacturerCode"]}
      hasImages={true}
      imageAttribute="samplePhoto"
      imageFolderPath={`products/sample-photos/${productType}`}
    />
  );
}
