"use client";

import { type LucideIcon, ChevronDown } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function desktopFilterTriggerClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-2 rounded-xs px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-card text-foreground hover:bg-primary/20",
  );
}

export default function DesktopFilterPopover({
  label,
  icon: Icon,
  open,
  onOpenChange,
  hasSelection,
  title,
  contentClassName = "w-80",
  showChevron = false,
  children,
}: {
  label: string;
  icon: LucideIcon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasSelection: boolean;
  title?: string;
  contentClassName?: string;
  showChevron?: boolean;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={desktopFilterTriggerClass(open || hasSelection)}
          aria-expanded={open}
        >
          <Icon className="size-4" aria-hidden />
          {label}
          {showChevron && (
            <ChevronDown className="size-3.5 opacity-70" aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("z-[110] bg-card p-3", contentClassName)}
      >
        {title && <p className="font-medium mb-2 text-sm">{title}</p>}
        {children}
      </PopoverContent>
    </Popover>
  );
}
