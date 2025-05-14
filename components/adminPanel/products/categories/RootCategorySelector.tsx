import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RootCategory,
  RootCategoryValues,
} from "@/firebase/schemas/productsSchemas";

export default function RootCategorySelector({
  onChange,
  value,
  defaultValue,
}: {
  onChange: (...event: any[]) => void;
  value: RootCategory | undefined;
  defaultValue?: RootCategory;
}) {
  return (
    <FormItem>
      <FormLabel>Kategoria główna</FormLabel>
      <Select
        onValueChange={onChange}
        value={value}
        defaultValue={defaultValue}
      >
        <FormControl>
          <SelectTrigger className="text-base border-primary ">
            <SelectValue className="text-base z-50" placeholder="Wybierz" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="bg-card border-primary">
          {RootCategoryValues.map((rootCategory) => (
            <SelectItem
              key={rootCategory}
              value={rootCategory}
              className="text-base z-50"
            >
              {rootCategory}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
}
