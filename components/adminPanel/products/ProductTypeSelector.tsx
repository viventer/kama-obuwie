"use client";

import { useProductTypeContext } from "./ProductsTypeContext";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { ProductType } from "@/firebase/schemas/productsSchemas";

export default function ProductTypeSelector() {
  const { productType, setProductType } = useProductTypeContext();

  return (
    <Tabs
      className="mb-4"
      defaultValue="obuwie"
      value={productType}
      onValueChange={(value) => setProductType(value as ProductType)}
    >
      <TabsList className="flex gap-2">
        <TabsTrigger value="obuwie" className="flex items-center gap-2">
          <p>Obuwie</p>
        </TabsTrigger>
        <TabsTrigger value="akcesoria" className="flex items-center gap-2">
          <p>Akcesoria</p>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
