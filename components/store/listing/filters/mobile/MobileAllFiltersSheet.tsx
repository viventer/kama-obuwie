"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AllFiltersContent from "../AllFiltersContent";

export default function MobileAllFiltersSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[60dvh] flex flex-col gap-0 p-4 overflow-x-hidden"
      >
        <SheetHeader className="px-0 pb-0 pt-2 shrink-0">
          <SheetTitle>Wszystkie filtry</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 pt-4">
          <AllFiltersContent
            variant="mobile"
            onShowProducts={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
