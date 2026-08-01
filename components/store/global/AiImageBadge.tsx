"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function AiImageBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            // preventDefault blocks parent <Link>/<a> navigation.
            // Radix skips its own toggle when defaultPrevented, so we toggle manually.
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={cn(
            "absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-xs bg-black/60 px-2 py-1 text-white backdrop-blur-sm cursor-pointer",
            className,
          )}
          aria-label="Informacja o zdjęciu wygenerowanym przez AI"
        >
          <SparklesIcon className="size-3.5" />
          <span className="text-xs font-semibold leading-none">AI</span>
        </button>
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
