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
} from "@/firebase/schemas/productsSchemas";
import DescriptionRow from "./DescriptionRow";
import PhotosReorder from "../PhotosReorder";
import { useConfirmDialog } from "../../global/ConfirmDialogProvider";
import { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

export interface DescriptionFormValues {
  description: Description;
  selectedRow: number;
  reorderedPhotos: EditedPhotoWithUrl[];
}

export const EditProductDescriptionForm = ({
  oldDescription,
  oldPhotos,
}: {
  oldDescription: Description | undefined;
  oldPhotos: EditedPhotoWithUrl[];
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

    try {
      const resp = await axios.patch(`/api/products/${id}`, {
        description: data.description,
        editedPhotos: newEditedPhotos,
      });
      if (resp.status !== 200) {
        throw new Error("Nie udało się edytować produktu.");
      }
      showToast("Opis został pomyślnie edytowany.", "success");
      router.push("/admin-panel/create-products/description");
    } catch (error) {
      showToast(`Wystąpił błąd podczas edycji opisu: ${error}`, "error");
    }
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
