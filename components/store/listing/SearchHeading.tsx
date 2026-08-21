"use client";

import { X } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SearchHeading({
  q,
  onClear,
}: {
  q: string;
  onClear: () => void;
}) {
  return (
    <Card className="bg-transparent rounded-xs border-0 shadow-none border-b-brand border-b-2 px-2 py-1 mb-4 flex items-center gap-4 w-fit ">
      <h2 className="text-lg md:text-xl flex items-center gap-2">
        <span>
          Wyniki dla: <span className="font-medium">{q}</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center cursor-pointer shrink-0"
        >
          <span
            className="inline-flex size-4 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            aria-hidden
          >
            <X className="size-2.5" />
          </span>
          <span className="sr-only">Usuń frazę wyszukiwania</span>
        </button>
      </h2>
    </Card>
  );
}
