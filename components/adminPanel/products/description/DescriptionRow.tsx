"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import DescriptionElementTypeSelector from "./DescriptionElementTypeSelector";
import IconButton from "../../global/IconButton";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react";
import DescriptionElementImageSelector from "./DescriptionElementImageSelector";
import TextEditor from "./TextEditor";

export default function DescriptionRow({
  index,
  onDeleteRow,
  moveRow,
  totalRows,
  rowId,
}: {
  onDeleteRow: () => void;
  index: number;
  moveRow: (from: number, to: number) => void;
  totalRows: number;
  rowId: string;
}) {
  const form = useFormContext();

  const elementsTypes = form.watch(`description.${index}.elementsTypes`);
  const selectedRow = form.watch("selectedRow");

  const elementsFieldsArray = useFieldArray({
    control: form.control,
    name: `description.${index}.elements` as const,
  });

  return (
    <div
      className={`mb-8 px-3 py-2 rounded-sm border ${
        selectedRow === index ? "border-primary/50" : "border-transparent"
      } transition-all`}
      onClick={() => form.setValue("selectedRow", index)}
    >
      <div
        className={`${
          selectedRow === index ? "flex" : "hidden"
        } w-full items-center justify-between gap-2 mb-2 z-50`}
      >
        <FormField
          control={form.control}
          name={`description.${index}.elementsTypes` as const}
          render={({ field }) => (
            <DescriptionElementTypeSelector
              value={field.value}
              onChange={(newTypes) => {
                field.onChange(newTypes);

                const newElements = newTypes.map((type) => {
                  return type === "image" ? { image: "" } : { content: "" };
                });

                form.setValue(`description.${index}.elements`, newElements);
              }}
            />
          )}
        />
        <div>
          {index < totalRows - 1 && (
            <IconButton
              onClick={(e) => {
                if (!e) return;
                e.stopPropagation();
                moveRow(index, index + 1);
                form.setValue("selectedRow", index + 1);
              }}
            >
              <ArrowDownIcon />
            </IconButton>
          )}
          {index > 0 && (
            <>
              <IconButton
                onClick={(e) => {
                  if (!e) return;
                  e.stopPropagation();
                  moveRow(index, index - 1);
                  form.setValue("selectedRow", index - 1);
                }}
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                className="hover:text-destructive"
                onClick={(e) => {
                  if (!e) return;
                  e.stopPropagation();
                  onDeleteRow();
                  form.setValue("selectedRow", -1);
                }}
              >
                <XIcon />
              </IconButton>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center gap-10 md:flex-row flex-col">
        {elementsFieldsArray.fields.map((elem, elemIndex) => {
          const elementType = elementsTypes[elemIndex];

          if (!elementType) return null;

          const namePrefix = `description.${index}.elements.${elemIndex}`;

          return (
            <FormField
              key={elem.id}
              control={form.control}
              name={
                elementType === "image"
                  ? `${namePrefix}.image`
                  : `${namePrefix}.content`
              }
              render={({ field }) =>
                elementType === "image" ? (
                  <DescriptionElementImageSelector
                    onChange={field.onChange}
                    value={field.value}
                  />
                ) : (
                  <TextEditor
                    id={`editor-${rowId}`}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}
