"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  Description,
  DescriptionSchema,
  EditedPhotoSchema,
  EditedPhotoWithUrl,
  EditedPhotoWithUrlSchema,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import DescriptionRow from "./DescriptionRow";
import PhotosReorder from "../PhotosReorder";
import { useConfirmDialog } from "../../../../app/providers/ConfirmDialogProvider";
import { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import DescriptionVariablesList from "./DescriptionVariablesList";
import ImportProductDescription from "./ImportProductDescription";
import { convertToAllegroDescription } from "@/server-actions/allegro/offers";
import { getColorVariantName } from "../helpers/productsHelpers";
import {
  DescriptionVariable,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getFormattedSizingTable } from "@/lib/utils";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { getImageUrl } from "@/server-actions/files/files";
import { choosingSizeImageFilePath } from "@/lib/constants";

export interface DescriptionFormValues {
  description: Description;
  selectedRow: number;
  reorderedPhotos: EditedPhotoWithUrl[];
}

export const EditProductDescriptionForm = ({
  oldDescription,
  oldPhotos,
  productData,
  isDone,
}: {
  oldDescription: Description | undefined;
  oldPhotos: EditedPhotoWithUrl[];
  productData?: ProductWithId;
  isDone?: boolean;
}) => {
  const form = useForm<DescriptionFormValues>({
    resolver: zodResolver(
      z.object({
        description: DescriptionSchema,
        selectedRow: z.number(),
        reorderedPhotos: z.array(EditedPhotoWithUrlSchema),
      })
    ),
    defaultValues: {
      description: oldDescription ?? [
        {
          elementsTypes: ["image", "text"],
          elements: [{ image: "" }, { content: "" }],
        },
      ],
      selectedRow: 0,
      reorderedPhotos: oldPhotos,
    },
  });

  const descriptionRows = useFieldArray({
    control: form.control,
    name: "description",
  });

  const { showDialog } = useConfirmDialog();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const handleReject = async (e: FormEvent) => {
    e.preventDefault();

    showDialog({
      message: "Czy na pewno chcesz odrzucić zmiany?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        router.back();
        showToast("Zmiany zostały odrzucone.", "default");
      },
    });
  };

  const { id } = useParams();

  const editAllegroOfferDescription = async (
    newDescription: Description,
    photosWithUrls: EditedPhotoWithUrl[]
  ) => {
    try {
      if (!productData?.SKU) {
        showToast("Brak danych SKU dla produktu", "error");
        return;
      }

      const offers: OfferWithId[] = [];
      for (const colorVariantName in productData.SKU) {
        const SKU = productData.SKU[colorVariantName];
        try {
          const response = await axios.get(`/api/offers?SKU=${SKU}`);
          const offerData = Object.values(response.data)[0] as OfferWithId;
          if (offerData) {
            offers.push(offerData);
          }
        } catch (error) {
          console.warn(`Nie znaleziono oferty dla SKU: ${SKU}`, error);
        }
      }

      if (offers.length === 0) {
        showToast("Nie znaleziono ofert dla tego produktu", "error");
        return;
      }

      if (!productData.sizingTableId) {
        showToast("Brak tabeli rozmiarów dla wystawionego produktu", "error");
        return;
      }

      let sizingTable: SizingTableWithId | null = null;
      try {
        const sizingTableResponse = await axios.get(
          `/api/sizing-tables/${productData.sizingTableId}`
        );
        sizingTable = sizingTableResponse.data;

        if (!sizingTable) {
          showToast("Nie udało się pobrać tabeli rozmiarów", "error");
          return;
        }
      } catch (error) {
        showToast("Błąd podczas pobierania tabeli rozmiarów", "error");
        console.error("Błąd pobierania tabeli rozmiarów:", error);
        return;
      }

      const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);

      for (const offer of offers) {
        if (!offer.allegroOffersIds) continue;

        const colorVariant = productData.colorVariants?.find(
          (variant) =>
            getColorVariantName(variant) ===
            Object.keys(productData.SKU!).find(
              (key) => productData.SKU![key] === offer.SKU
            )
        );

        if (!colorVariant) continue;

        const colorVariantName = getColorVariantName(colorVariant);
        const variantPhotos = photosWithUrls.filter(
          (photo) => photo.colorVariantName === colorVariantName
        );

        const imagesUrls = variantPhotos.map((photo) => photo.url || "");
        imagesUrls.push(choosingSizeImageUrl as string);

        const baseVariableValues: Partial<Record<DescriptionVariable, string>> =
          {
            kolor: colorVariant.color,
            marka: productData.brand || "",
            "kod producenta": productData.manufacturerCode || "",
            "tytuł oferty": offer.title,
          };

        const formattedSizingTable = getFormattedSizingTable(
          sizingTable.insoleLengths
        );
        baseVariableValues.rozmiarówka = formattedSizingTable;

        const AL1Offers = offer.allegroOffersIds.AL1 || {};
        const AL2Offers = offer.allegroOffersIds.AL2 || {};

        const allSizes = new Set([
          ...Object.keys(AL1Offers),
          ...Object.keys(AL2Offers),
        ]);

        for (const size of allSizes) {
          const insoleLength = sizingTable.insoleLengths.find(
            (insole) => Number(insole.size) === Number(size)
          )?.insoleLength;

          if (!insoleLength) {
            showToast(
              `Brak długości wkładki dla rozmiaru ${size} w tabeli rozmiarów`,
              "error"
            );
            return;
          }

          const sizeSpecificVariables: Record<DescriptionVariable, string> = {
            ...baseVariableValues,
            rozmiar: size,
            "długość wkładki": `${insoleLength
              .toString()
              .replace(".", ",")} cm`,
          } as Record<DescriptionVariable, string>;

          const allegroDescription = await convertToAllegroDescription(
            newDescription,
            imagesUrls,
            sizeSpecificVariables
          );

          const updateData = {
            description: allegroDescription,
          };

          const editPromises: Promise<any>[] = [];

          if (AL1Offers[size]) {
            editPromises.push(
              axios.patch(`/api/allegro/offers/${AL1Offers[size]}`, {
                offerPartial: updateData,
                salesChannel: "AL1",
              })
            );
          }

          if (AL2Offers[size]) {
            editPromises.push(
              axios.patch(`/api/allegro/offers/${AL2Offers[size]}`, {
                offerPartial: updateData,
                salesChannel: "AL2",
              })
            );
          }

          try {
            await Promise.all(editPromises);
          } catch (error) {
            handleError(
              error,
              `Błąd podczas edycji ofert dla rozmiaru ${size}`
            );
            showToast(`Błąd podczas edycji niektórych ofert Allegro`, "error");
          }
        }
      }

      showToast("Opisy ofert Allegro zostały zaktualizowane", "success");
    } catch (error) {
      handleError(error, `Błąd podczas edycji opisów Allegro`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data: DescriptionFormValues = form.getValues();
    const newEditedPhotos = data.reorderedPhotos.map((photo) => ({
      colorVariantName: photo.colorVariantName || "",
      filePath: photo.filePath || "",
    }));
    try {
      DescriptionSchema.parse(data.description);
      z.array(EditedPhotoSchema).parse(newEditedPhotos);
    } catch (error) {
      showToast(`Wystąpił błąd walidacji danych: ${error}`, "error");
      return;
    }

    if (isDone) {
      await editAllegroOfferDescription(data.description, data.reorderedPhotos);
    }

    try {
      const resp = await axios.patch(`/api/products/${id}`, {
        description: data.description,
        editedPhotos: newEditedPhotos,
      });
      if (resp.status !== 200) {
        throw new Error("Nie udało się edytować produktu.");
      }
      showToast("Opis został pomyślnie edytowany.", "success");
      if (isDone) {
        router.push("/admin-panel/products");
      } else {
        router.push("/admin-panel/create-products/description");
      }
    } catch (error) {
      showToast(`Wystąpił błąd podczas edycji opisu: ${error}`, "error");
    }
  };

  const updateDescriptionRows = (description: Description) => {
    descriptionRows.replace(description);
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name={"reorderedPhotos" as const}
        render={({ field }) => (
          <PhotosReorder photos={field.value} setPhotos={field.onChange} />
        )}
      />

      <FormField
        control={form.control}
        name={"description" as const}
        render={({ field }) => (
          <ImportProductDescription
            setDescription={(description: Description) => {
              updateDescriptionRows(description);
            }}
          />
        )}
      />

      <DescriptionVariablesList />

      <h3 className="font-bold mb-2">Edytuj opis</h3>
      {descriptionRows.fields.map((row, rowIndex) => (
        <DescriptionRow
          key={row.id}
          index={rowIndex}
          onDeleteRow={() => descriptionRows.remove(rowIndex)}
          moveRow={(from, to) => descriptionRows.move(from, to)}
          totalRows={descriptionRows.fields.length}
        />
      ))}

      <Button
        type="button"
        onClick={() => {
          descriptionRows.append({
            elementsTypes: ["image", "text"],
            elements: [{ image: "" }, { content: "" }],
          });

          form.setValue("selectedRow", descriptionRows.fields.length);
        }}
        className="mb-4"
      >
        Dodaj wiersz
      </Button>

      <div className="flex gap-4 mt-8">
        <Button type="button" onClick={handleSubmit} className="w-fit">
          Zapisz
        </Button>
        <Button
          type="button"
          onClick={handleReject}
          className="w-fit"
          variant="destructive"
        >
          Odrzuć
        </Button>
      </div>
    </Form>
  );
};
