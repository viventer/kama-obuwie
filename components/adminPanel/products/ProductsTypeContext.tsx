"use client";

import { ProductType } from "@/firebase/schemas/productsSchemas";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ProductTypeContext {
  productType: ProductType;
  setProductType: Dispatch<SetStateAction<ProductType>>;
}

const ProductTypeContext = createContext<ProductTypeContext | undefined>(
  undefined
);

export function ProductTypeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productType, setProductType] = useState<ProductType>("obuwie");

  return (
    <ProductTypeContext.Provider value={{ productType, setProductType }}>
      {children}
    </ProductTypeContext.Provider>
  );
}

export function useProductTypeContext() {
  const context = useContext(ProductTypeContext);
  if (!context) {
    throw new Error(
      "useProductTypeContext must be used within a ProductTypeContextProvider"
    );
  }
  return context;
}
