import PhaseSelector from "@/components/adminPanel/global/PhaseSelector";
import { ProductTypeContextProvider } from "@/components/adminPanel/assortment/ProductsTypeContext";
import ProductTypeSelector from "@/components/adminPanel/assortment/ProductTypeSelector";
import {
  ImageIcon,
  InfoIcon,
  PlusCircleIcon,
  SendIcon,
  TextIcon,
  Wand2Icon,
} from "lucide-react";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <ProductTypeContextProvider>
      <ProductTypeSelector />
      {children}
      <PhaseSelector
        basePath="/admin-panel/create-products"
        options={[
          { value: "new", icon: <PlusCircleIcon className="size-5" /> },
          { value: "photos", icon: <ImageIcon className="size-5" /> },
          { value: "photos-edit", icon: <Wand2Icon className="size-5" /> },
          { value: "parameters", icon: <InfoIcon className="size-5" /> },
          { value: "description", icon: <TextIcon className="size-5" /> },
          { value: "post-offer", icon: <SendIcon className="size-5" /> },
        ]}
      />
    </ProductTypeContextProvider>
  );
}
