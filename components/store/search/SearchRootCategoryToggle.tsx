"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ROOT_CATEGORY_LABELS } from "@/helpers/listingFilters/types";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { useStoreSearch } from "./StoreSearchContext";
import { cn } from "@/lib/utils";

const OPTIONS: { value: RootCategory; label: string }[] = [
  {
    value: "obuwie męskie",
    label: ROOT_CATEGORY_LABELS["obuwie męskie"],
  },
  {
    value: "obuwie damskie",
    label: ROOT_CATEGORY_LABELS["obuwie damskie"],
  },
  {
    value: "obuwie dziecięce",
    label: ROOT_CATEGORY_LABELS["obuwie dziecięce"],
  },
];

export default function SearchRootCategoryToggle({
  className,
}: {
  className?: string;
}) {
  const { rootCategory, setRootCategory } = useStoreSearch();

  return (
    <ToggleGroup
      type="single"
      value={rootCategory ?? ""}
      onValueChange={(value) => {
        if (!value) {
          setRootCategory(undefined);
          return;
        }
        setRootCategory(value as RootCategory);
      }}
      className={cn("w-full justify-start gap-1 flex-wrap", className)}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="rounded-xs px-3 h-9 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground bg-foreground/10"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
