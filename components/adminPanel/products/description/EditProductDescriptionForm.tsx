"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  Description,
  DescriptionSchema,
  EditedPhoto,
  EditedPhotoSchema,
  EditedPhotoWithUrl,
  EditedPhotoWithUrlSchema,
} from "@/firebase/schemas/productsSchemas";
import DescriptionRow from "./DescriptionRow";
import { useEffect } from "react";
import PhotosReorder from "../PhotosReorder";

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

  const description = form.watch("description.0.elements");

  useEffect(() => {
    console.log("description", description);
  }, [description]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name={"reorderedPhotos" as const}
        render={({ field }) => (
          <PhotosReorder photos={field.value} setPhotos={field.onChange} />
        )}
      />
      <h3 className="font-bold">Edytuj opis</h3>
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

      <Button
        type="button"
        onClick={() => console.log(form.getValues())}
        className="w-full"
      >
        Zapisz zmiany
      </Button>
    </Form>
  );
};
