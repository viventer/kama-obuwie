"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const CHIP_CLASS =
  "text-base h-10 bg-foreground/10 border-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/30 shadow-none px-3 w-fit hover:text-text cursor-pointer rounded-xs";

export default function FilterChipGroup({
  options,
  selected,
  onChange,
  className,
  itemClassName,
}: {
  options: { value: string; label: string }[];
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
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={cn(CHIP_CLASS, itemClassName)}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
