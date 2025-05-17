import React from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { Option } from "./SingleSelect";

interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  availableOptions: Option[];
}

export default function MultipleSelect({
  label,
  value,
  onChange,
  availableOptions,
}: MultiSelectProps) {
  const isSelected = (option: string) => value.includes(option);

  const toggleOption = (option: string) => {
    if (isSelected(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="justify-between w-full text-base">
            {value.length > 0 ? value.join(", ") : "Wybierz..."}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-h-60 overflow-auto">
          {availableOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 hover:bg-accent hover:rounded"
            >
              <Checkbox
                checked={isSelected(option.value)}
                onCheckedChange={() => toggleOption(option.value)}
              />
              <span className="text-base">{option.name}</span>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}
