import { cn } from "@/lib/utils";
import { FormEvent } from "react";

export default function IconButton({
  children,
  className,
  disabled = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  onClick?: (e?: FormEvent) => void;
}) {
  return (
    <button
      className={cn("hover:text-primary hover:cursor-pointer", className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
