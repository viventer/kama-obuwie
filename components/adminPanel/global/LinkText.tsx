import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LinkText({
  children,
  href,
  className,
  onClick,
  target,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
  target?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      target={target}
      className={cn(
        "decoration-1 decoration-brand underline underline-offset-3 hover:decoration-accent/0 transition-all duration-150 font-medium text-text",
        className
      )}
    >
      {children}
    </Link>
  );
}
