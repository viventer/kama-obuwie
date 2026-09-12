"use client";

import { useRouter } from "next/navigation";
import ProductFromList from "./ProductFromList";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Ghost } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import { groupVariantsByProductId } from "@/helpers/listingVariants";
import { analytics } from "@/firebase/firebase";
import { logEvent } from "firebase/analytics";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";

export default function ProductsList({
  displayName,
  products,
  categoryId,
  categoryName,
}: {
  displayName: string;
  products: ProductListingData[];
  categoryId: string;
  categoryName: string;
}) {
  const router = useRouter();
  const { currentBreakpoint } = useBreakpoint();

  // Określenie liczby produktów na podstawie breakpointu
  const getProductsCount = () => {
    switch (currentBreakpoint) {
      case "xs":
        return 1;
      case "sm":
        return 2;
      case "md":
        return 3;
      case "lg":
        return 4;
      case "xl":
      default:
        return 4;
    }
  };

  const productsToShow = getProductsCount();
  const variantsByProductId = groupVariantsByProductId(products);

  return (
    <section>
      <SubpageHeading text={displayName} />
      <div className="flex w-full justify-between">
        <div className="flex gap-4 w-full pr-4 md:pr-8 lg:pr-12">
          {products.slice(0, productsToShow).map((product) => (
            <ProductFromList
              key={`${product.id}-${product.colorVariantName}`}
              product={product}
              variants={variantsByProductId.get(product.id)}
            />
          ))}
        </div>
        <Card
          className="p-0 px-2 sm:px-4 lg:px-6 flex justify-center cursor-pointer bg-brand/25 transition-colors duration-200 hover:bg-brand/50 active:bg-brand/75 flex-shrink-0"
          onClick={() => {
            if (analytics) {
              logEvent(analytics, "view_item_list", {
                item_list_id: categoryId,
                item_list_name: categoryName,
                from: "home_products_list",
              });
            }

            router.push(`/listing/${categoryId}`);
          }}
        >
          <Button
            variant={"ghost"}
            onClick={() => {
              if (analytics) {
                logEvent(analytics, "view_item_list", {
                  item_list_id: categoryId,
                  item_list_name: categoryName,
                  from: "home_products_list",
                });
              }
              router.push(`/listing/${categoryId}`);
            }}
            className="hover:translate-x-1 transition-transform w-fit h-fit"
          >
            <ArrowRightIcon className="size-8 lg:size-12 hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
