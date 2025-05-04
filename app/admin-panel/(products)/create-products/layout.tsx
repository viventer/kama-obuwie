import { ProductTypeContextProvider } from "@/components/adminPanel/products/ProductsTypeContext";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return <ProductTypeContextProvider>{children}</ProductTypeContextProvider>;
}
