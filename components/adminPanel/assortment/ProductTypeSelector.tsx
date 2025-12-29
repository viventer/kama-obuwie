"use client";

import { useProductTypeContext } from "./ProductsTypeContext";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { ProductType } from "@/firebase/schemas/productsSchemas";
import { useParams } from "next/navigation";

export default function ProductTypeSelector() {
  const { productType, setProductType } = useProductTypeContext();

  const params = useParams();
  const isDetailPage = params?.productId || params?.id;

  return (
    <Tabs
      className={`mb-4 ${isDetailPage ? "hidden" : "block"}`}
      defaultValue="obuwie"
      value={productType}
      onValueChange={(value) => setProductType(value as ProductType)}
    >
      <TabsList className="flex gap-2">
        <TabsTrigger value="obuwie" className="flex items-center gap-2 ">
          <p>Obuwie</p>
        </TabsTrigger>
        <TabsTrigger value="akcesoria" className="flex items-center gap-2 ">
          <p>Akcesoria</p>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
