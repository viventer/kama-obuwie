"use client";

import { useRouter } from "next/navigation";
import ProductFromList from "./ProductFromList";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Ghost } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export default function ProductsList({
  displayName,
  products,
  categoryId,
}: {
  displayName: string;
  products: ProductListingData[];
  categoryId: string;
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

  return (
    <section>
      <h3 className="text-2xl font-bold mb-3">{displayName}</h3>
      <div className="flex w-full justify-between">
        <div className="flex gap-4 w-full pr-4 md:pr-8 lg:pr-12">
          {products.slice(0, productsToShow).map((product) => (
            <ProductFromList key={product.id} product={product} />
          ))}
        </div>
        <Card
          className="p-0 px-2 sm:px-4 lg:px-6 flex justify-center cursor-pointer bg-brand/25 transition-colors duration-200 hover:bg-brand/50 active:bg-brand/75 flex-shrink-0"
          onClick={() => router.push(`/listing?categoryId=${categoryId}`)}
        >
          <Button
            variant={"ghost"}
            onClick={() => router.push(`/listing?categoryId=${categoryId}`)}
            className="hover:translate-x-1 transition-transform w-fit h-fit"
          >
            <ArrowRightIcon className="size-8 lg:size-12 hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
