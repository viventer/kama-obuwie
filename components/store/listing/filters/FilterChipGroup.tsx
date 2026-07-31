"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const CHIP_CLASS =
  "text-base h-10 bg-foreground/10 border-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/30 shadow-none px-3 w-fit hover:text-text cursor-pointer rounded-xs";

export type FilterChipOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export default function FilterChipGroup({
  options,
  selected,
  onChange,
  className,
  itemClassName,
}: {
  options: FilterChipOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ToggleGroup
      value={selected}
      onValueChange={onChange}
      type="multiple"
      variant="outline"
      size="sm"
      className={cn(
        "flex justify-start gap-2 flex-wrap",
        className,
      )}
    >
      {options.map((option) => {
        const disabled = option.disabled === true;

        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            disabled={disabled}
            className={cn(
              CHIP_CLASS,
              itemClassName,
              disabled && "cursor-not-allowed !opacity-30 hover:bg-foreground/10",
            )}
          >
            <span className={cn(disabled && "line-through decoration-2")}>
              {option.label}
            </span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
