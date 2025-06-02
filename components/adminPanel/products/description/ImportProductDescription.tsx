"use client";

import { Description, ProductWithId } from "@/firebase/schemas/productsSchemas";
import SelectProductDialog from "../SelectProductDialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useToast } from "@/hooks/useToast";

export default function ImportProductDescription({
  setDescription,
}: {
  setDescription: (description: Description) => void;
}) {
  const { productType } = useProductTypeContext();
  const [availableProducts, setAvailableProducts] = useState<ProductWithId[]>(
    []
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      const resp = await axios.get(
        `/api/products?creationStage=postOffer,done&type=${productType}`
      );
      setAvailableProducts(Object.values(resp.data) || []);
    })();
  }, []);

  const importDescription = () => {
    const selectedProduct = availableProducts.find(
      (product) => product.id === selectedProductId
    );
    if (selectedProduct && selectedProduct.description) {
      setDescription(selectedProduct.description);
      console.log("Zaimportowano opis produktu:", selectedProduct.description);
    } else {
      showToast("Nie wybrano produktu lub brak opisu", "error");
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Zaimportuj opis z produktu</h3>
      <SelectProductDialog
        availableProducts={availableProducts}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        onConfirm={importDescription}
      />
    </div>
  );
}
