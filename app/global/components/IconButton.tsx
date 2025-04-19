import { cn } from "@/lib/utils";

export default function IconButton({
  children,
  className,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn("hover:text-accent hover:cursor-pointer", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
