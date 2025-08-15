import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import Image from "next/image";
import React from "react";

export default function ProductFromSelect({ data }: { data: ProductWithId }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={data.samplePhoto as string} alt="" width="200" height="200" />
    </div>
  );
}
