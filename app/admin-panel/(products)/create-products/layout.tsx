import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import ProductTypeSelector from "@/components/adminPanel/products/ProductTypeSelector";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SubpageHeading text="Nowe produkty" />
      <ProductTypeSelector />
    </>
  );
}
