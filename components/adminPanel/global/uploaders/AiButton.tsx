"use client";

import { SparklesIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AiButton({
  isAiCoCreated,
  onToggle,
  disabled,
}: {
  isAiCoCreated?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  const button = (
    <Button
      variant={"ghost"}
      size={"icon"}
      disabled={disabled || !onToggle}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (disabled || !onToggle) return;
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        disabled && "cursor-not-allowed opacity-70",
        "bg-background/70 hover:bg-background/100 rounded-full",
        isAiCoCreated ? "text-accent border-accent border" : "text-foreground",
      )}
      aria-label={
        isAiCoCreated
          ? "Zdjęcie oznaczone jako AI"
          : "Oznacz zdjęcie jako wygenerowane przez AI"
      }
    >
      <SparklesIcon className={cn("size-4")} strokeWidth={2} />
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="absolute top-0.5 left-0.5 inline-flex">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Oznaczenia AI nie można zmienić po opublikowaniu oferty
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className="absolute top-0.5 left-0.5 inline-flex">{button}</span>
  );
}
