"use client";

import IconButton from "@/components/adminPanel/global/IconButton";
import { ShoppingBasketIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShoppingCartButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();

  return (
    <IconButton
      className={className}
      onClick={() => router.push("/shopping-cart")}
    >
      <ShoppingBasketIcon />
    </IconButton>
  );
}
