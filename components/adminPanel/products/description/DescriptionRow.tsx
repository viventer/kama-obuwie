import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import { DescriptionFormValues } from "./EditProductDescriptionForm";
import { FormField } from "@/components/ui/form";
import DescriptionElementTypeSelector from "./DescriptionElementTypeSelector";
import IconButton from "../../global/IconButton";
import { XIcon } from "lucide-react";
import DescriptionElementImageSelector from "./DescriptionElementImageSelector";

export default function DescriptionRow({
  index,
  onDeleteRow,
}: {
  onDeleteRow: () => void;
  index: number;
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
      } transition-all `}
      onClick={() => form.setValue("selectedRow", index)}
      onBlur={() => form.setValue("selectedRow", -1)}
      onFocus={() => form.setValue("selectedRow", index)}
    >
      <div
        className={`${
          selectedRow === index ? "flex" : "hidden"
        } w-full items-center justify-between mb-2`}
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
        {index !== 0 && (
          <IconButton className="hover:text-destructive" onClick={onDeleteRow}>
            <XIcon />
          </IconButton>
        )}
      </div>

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
                `description.${index}.elements.${elemIndex}.content` as const
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
            name={`description.${index}.elements.${elemIndex}.content` as const}
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
  );
}
