import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileFilterBarButton({
  label,
  icon: Icon,
  active,
  onClick,
  expanded,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xs px-2 py-4 text-sm font-medium cursor-pointer transition-colors min-w-0",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-transparent text-foreground hover:bg-primary/20",
      )}
      onClick={onClick}
      aria-expanded={expanded}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}
