import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchSelect({
  label,
  onChange,
  value,
  defaultValue,
  availableOptions,
}: {
  label: string;
  onChange: (...event: any[]) => void;
  value: string | undefined;
  defaultValue?: string;
  availableOptions: string[];
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
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
          {availableOptions.map((option) => (
            <SelectItem key={option} value={option} className="text-base z-50">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
}
