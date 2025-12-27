"use client";

import IconButton from "@/components/adminPanel/global/IconButton";
import { ShoppingBasketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ShoppingCartPreview from "./ShoppingCartPreview";

export default function ShoppingCartButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();

  return (
    <HoverCard>
      <IconButton
        className={className}
        onClick={() => router.push("/shopping-cart")}
      >
        <HoverCardTrigger>
          <ShoppingBasketIcon />
        </HoverCardTrigger>
      </IconButton>
      <HoverCardContent className="absolute right-0 top-4 w-fit hidden sm:block bg-background">
        <ShoppingCartPreview />
      </HoverCardContent>
    </HoverCard>
  );
}
