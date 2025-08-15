import { ProductTypeContextProvider } from "@/components/adminPanel/assortment/ProductsTypeContext";
import ProductTypeSelector from "@/components/adminPanel/assortment/ProductTypeSelector";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <ProductTypeContextProvider>
      <ProductTypeSelector />
      {children}
    </ProductTypeContextProvider>
  );
}
