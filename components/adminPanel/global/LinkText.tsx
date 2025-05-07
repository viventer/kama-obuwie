import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LinkText({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "decoration-1 decoration-accent/0 underline underline-offset-3 hover:decoration-accent transition-all duration-150",
        className
      )}
    >
      {children}
    </Link>
  );
}
