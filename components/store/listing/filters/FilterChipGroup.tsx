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

type FilterChipGroupBaseProps = {
  options: FilterChipOption[];
  className?: string;
  itemClassName?: string;
};

type FilterChipGroupMultipleProps = FilterChipGroupBaseProps & {
  type?: "multiple";
  selected: string[];
  onChange: (values: string[]) => void;
};

type FilterChipGroupSingleProps = FilterChipGroupBaseProps & {
  type: "single";
  selected: string;
  onChange: (value: string) => void;
};

export type FilterChipGroupProps =
  | FilterChipGroupMultipleProps
  | FilterChipGroupSingleProps;

export default function FilterChipGroup(props: FilterChipGroupProps) {
  const { options, className, itemClassName } = props;

  const items = options.map((option) => {
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
  });

  const groupClassName = cn("flex justify-start gap-2 flex-wrap", className);

  if (props.type === "single") {
    return (
      <ToggleGroup
        value={props.selected}
        onValueChange={props.onChange}
        type="single"
        variant="outline"
        size="sm"
        className={groupClassName}
      >
        {items}
      </ToggleGroup>
    );
  }

  return (
    <ToggleGroup
      value={props.selected}
      onValueChange={props.onChange}
      type="multiple"
      variant="outline"
      size="sm"
      className={groupClassName}
    >
      {items}
    </ToggleGroup>
  );
}
