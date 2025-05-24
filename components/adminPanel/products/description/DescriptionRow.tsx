import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import DescriptionElementTypeSelector from "./DescriptionElementTypeSelector";
import IconButton from "../../global/IconButton";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react";
import DescriptionElementImageSelector from "./DescriptionElementImageSelector";

export default function DescriptionRow({
  index,
  onDeleteRow,
  moveRow,
  totalRows,
}: {
  onDeleteRow: () => void;
  index: number;
  moveRow: (from: number, to: number) => void;
  totalRows: number;
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
        } w-full items-center justify-between mb-2 z-50`}
      >
        <FormField
          control={form.control}
          name={`description.${index}.elementsTypes` as const}
          render={({ field }) => (
            <DescriptionElementTypeSelector
              value={field.value}
              onChange={field.onChange}
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
      <div className="flex justify-center items-center gap-10">
        {elementsFieldsArray.fields.map((elem, elemIndex) => {
          if (elementsTypes.length === 1 && elemIndex === 1) {
            return null;
          }

          if (elementsTypes[elemIndex] === "image") {
            return (
              <FormField
                key={elem.id}
                control={form.control}
                name={
                  `description.${index}.elements.${elemIndex}.image` as const
                }
                render={({ field }) => (
                  <DescriptionElementImageSelector
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            );
          }

          return (
            <FormField
              key={elem.id}
              control={form.control}
              name={
                `description.${index}.elements.${elemIndex}.content` as const
              }
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Wpisz treść opisu"
                  className="border rounded-xl p-2 w-full"
                />
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
