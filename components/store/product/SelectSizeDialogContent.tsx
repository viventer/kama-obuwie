"use client";

import { useState, useRef } from "react";
import { Availability } from "@/firebase/schemas/offersSchemas";
import ProductPageSizeSelector from "./ProductPageSizeSelector";

export default function SelectSizeDialogContent({
  availability,
  selectedSize,
  onSizeChange,
}: {
  availability: Record<string, Availability>;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}) {
  const [localSelectedSize, setLocalSelectedSize] = useState(selectedSize);
  const isInitialMount = useRef(true);

  const handleSizeChange = (size: string) => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setLocalSelectedSize(size);
    onSizeChange(size);
  };

  return (
    <ProductPageSizeSelector
      availability={availability}
      selectedSize={localSelectedSize}
      onSizeChange={handleSizeChange}
    />
  );
}
