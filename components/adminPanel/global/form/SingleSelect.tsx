import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IconButton from "../IconButton";
import { XIcon } from "lucide-react";

export type Option = {
  name: string;
  value: string;
};

export default function SingleSelect({
  label,
  onChange,
  value,
  defaultValue,
  availableOptions,
  placeholder = "Wybierz",
  disabled = false,
}: {
  label?: string;
  onChange: (...event: any[]) => void;
  value: string | undefined;
  defaultValue?: string;
  placeholder?: string;
  availableOptions: Option[];
  disabled?: boolean;
}) {
  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <div className="flex gap-2">
        <Select
          onValueChange={onChange}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
        >
          <FormControl>
            <SelectTrigger className="text-base border-primary ">
              <SelectValue
                className="text-base z-50"
                placeholder={placeholder}
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="bg-card border-primary">
            {availableOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-base z-50"
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <IconButton
          onClick={() => onChange("")}
          className="text-primary"
          disabled={disabled}
        >
          <XIcon className="size-6" />
        </IconButton>
      </div>
    </FormItem>
  );
}
