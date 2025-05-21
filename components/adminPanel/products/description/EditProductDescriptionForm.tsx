"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  Description,
  DescriptionSchema,
} from "@/firebase/schemas/productsSchemas";
import DescriptionRow from "./DescriptionRow";
import { useEffect } from "react";

export interface DescriptionFormValues {
  description: Description;
  selectedRow: number;
}

export const EditProductDescriptionForm = ({
  oldDescription,
}: {
  oldDescription: Description | undefined;
}) => {
  const form = useForm<DescriptionFormValues>({
    resolver: zodResolver(
      z.object({ description: DescriptionSchema, selectedRow: z.number() })
    ),
    defaultValues: {
      description: oldDescription || [
        {
          elementsTypes: ["text"],
          elements: [{ content: "" }, { image: "" }],
        },
      ],
      selectedRow: 0,
    },
  });

  const descriptionRows = useFieldArray({
    control: form.control,
    name: "description",
  });

  useEffect(() => {
    console.log("descriptionRows", descriptionRows.fields);
  }, [descriptionRows.fields]);

  return (
    <Form {...form}>
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
            elementsTypes: ["text"],
            elements: [{ content: "" }, { image: "" }],
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
        Zapisz opis
      </Button>
    </Form>
  );
};
