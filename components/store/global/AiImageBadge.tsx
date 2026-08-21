"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AiImageBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={cn(
            "absolute top-2 left-2 z-10 bg-black/50   hover:bg-black/70 rounded-xs",
            className,
          )}
          aria-label="Informacja o zdjęciu wygenerowanym przez AI"
        >
          <SparklesIcon className="size-3.5" />
          <span className="text-xs font-medium leading-none">AI</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-100000 w-64 p-3 text-sm"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        Zdjęcie zostało wygenerowane lub zmodyfikowane z pomocą sztucznej
        inteligencji
      </PopoverContent>
    </Popover>
  );
}
