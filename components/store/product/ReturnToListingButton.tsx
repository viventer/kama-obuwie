"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analytics } from "@/firebase/firebase";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { cn } from "@/lib/utils";
import { logEvent } from "firebase/analytics";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const enteredProductPageDirectly = (): boolean => {
  const [nav] = performance.getEntriesByType("navigation");
  if (!nav) return true;
  return new URL(nav.name).pathname === window.location.pathname;
};

export default function ReturnToListingButton({
  category,
  className,
}: {
  category: CategoryWithId;
  className?: string;
}) {
  const router = useRouter();

  const clickHandler = () => {
    if (!enteredProductPageDirectly()) {
      router.back();
      return;
    }

    if (analytics) {
      logEvent(analytics, "view_item_list", {
        item_list_id: category.id,
        item_list_name: category.name,
        from: "product_page",
      });
    }
    router.push(`/listing/${category.id}`);
  };

  return (
    <Card
      className={cn(
        "flex-row gap-2 items-center pl-2 pr-2 cursor-pointer transition-colors md:hover:bg-text/10 active:bg-text/15 w-fit shadow-none border-none py-0 bg-transparent md:py-1 md:pr-4",
        className,
      )}
      onClick={clickHandler}
      aria-label="Wróć"
    >
      <Button
        variant="ghost"
        className="hover:translate-x-[-4px] transition-transform px-0! md:px-2! hover:bg-transparent md:hover:bg-foreground/15"
      >
        <ArrowLeft className="size-5" />
      </Button>
      <p className="capitalize text-base font-medium">Wróć</p>
    </Card>
  );
}
