import CreationStageSelector from "@/components/adminPanel/products/create/CreationStageSelector";
import { ProductTypeContextProvider } from "@/components/adminPanel/products/ProductsTypeContext";
import ProductTypeSelector from "@/components/adminPanel/products/ProductTypeSelector";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <ProductTypeContextProvider>
      <ProductTypeSelector />
      {children}
      <CreationStageSelector />
    </ProductTypeContextProvider>
  );
}
