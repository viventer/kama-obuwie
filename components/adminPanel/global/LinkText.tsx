import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LinkText({
  children,
  href,
  className,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "decoration-1 decoration-accent/0 underline underline-offset-3 hover:decoration-accent transition-all duration-150",
        className
      )}
    >
      {children}
    </Link>
  );
}
