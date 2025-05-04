"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ProductTypeContext {
  productType: "shoes" | "accessories";
  setProductType: Dispatch<SetStateAction<"shoes" | "accessories">>;
}

const ProductTypeContext = createContext<ProductTypeContext | undefined>(
  undefined
);

export function ProductTypeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productType, setProductType] = useState<"shoes" | "accessories">(
    "shoes"
  );

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
