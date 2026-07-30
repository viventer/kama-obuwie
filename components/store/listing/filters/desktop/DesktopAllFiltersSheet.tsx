"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AllFiltersContent from "../AllFiltersContent";

export default function DesktopAllFiltersSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-4 overflow-x-hidden"
      >
        <SheetHeader className="px-0 pb-2 shrink-0">
          <SheetTitle>Wszystkie filtry</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0">
          <AllFiltersContent onShowProducts={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
