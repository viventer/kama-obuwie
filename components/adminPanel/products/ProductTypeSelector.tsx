"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePathname, useRouter } from "next/navigation";

export default function ProductTypeSelector() {
  const pathname = usePathname();
  const isShoesPage = pathname.includes("shoes");
  const isAccessoriesPage = pathname.includes("accessories");
  const router = useRouter();

  return (
    <RadioGroup
      defaultValue="obuwie"
      onValueChange={(value) => {
        if (value === "obuwie" && !isShoesPage) {
          router.push(pathname.replace("accessories", "shoes"));
        } else if (value === "akcesoria" && !isAccessoriesPage) {
          router.push(pathname.replace("shoes", "accessories"));
        }
      }}
    >
      <Label className="text-lg">Typ produktów</Label>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="shoes" value="obuwie" />
        <Label htmlFor="shoes">Obuwie</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="accessories" value="akcesoria" />
        <Label htmlFor="accessories">Akcesoria</Label>
      </div>
    </RadioGroup>
  );
}
