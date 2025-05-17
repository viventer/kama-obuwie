import React from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
    <FormItem className="w-full">
      <FormLabel>{label}</FormLabel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="justify-between w-full text-base  bg-transparent border-input focus-visible:border-secondary border hover:bg-primary/15 hover:cursor-pointer font-normal">
            {value.length > 0 ? value.join(", ") : "Wybierz"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-md max-h-60 overflow-auto scrollbar">
          {availableOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected(option.value)}
              onCheckedChange={() => toggleOption(option.value)}
            >
              {option.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FormItem>
  );
}
