"use client";

import {
  EditedPhoto,
  Product,
  ProductCreationStage,
  ProductWithId,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "../helpers/productsHelpers";
import ProductImagesUploader from "../ProductImagesUploader";
import { FormEvent, Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteUnusedPhotosFromStorage } from "@/server-actions/files/files";
import { useProductTypeContext } from "../ProductsTypeContext";
import MiniLoader from "../../global/MiniLoader";

export default function CreateProductsPhotosForm({
  productData,
  creationStage,
}: {
  productData: ProductWithId;
  creationStage: ProductCreationStage;
}) {
  const { id, colorVariants, rawPhotos, editedPhotos } = productData;

  const { productType, setProductType } = useProductTypeContext();

  const storageEndpoint =
    creationStage === "photos" ? "raw-photos" : "edited-photos";
  const urlEndpoint = creationStage === "photos" ? "photos" : "photos-edit";

  const folderPath = `products/${storageEndpoint}/${productType}/${id}`;

  const [newRawPhotos, setNewRawPhotos] = useState<RawPhoto[]>(rawPhotos || []);
  const [newEditedPhotos, setNewEditedPhotos] = useState<EditedPhoto[]>(
    editedPhotos || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [activeUploads, setActiveUploads] = useState<number>(0);

  const { showToast } = useToast();

  // Funkcja do śledzenia aktywnych uploadów
  const handleUploadChange = (isStarting: boolean) => {
    setActiveUploads((prev) => {
      const newCount = isStarting ? prev + 1 : prev - 1;
      // Ustaw stan isUploading na podstawie liczby aktywnych uploadów
      setIsUploading(newCount > 0);
      return newCount >= 0 ? newCount : 0;
    });
  };

  useEffect(() => {
    setProductType(productData.productType);
  }, [productData]);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let updateData: Partial<Product> | null = null;

    if (creationStage === "photos") {
      updateData = {
        rawPhotos: newRawPhotos,
      };
    } else {
      updateData = {
        editedPhotos: newEditedPhotos,
      };
    }

    try {
      await axios.patch(`/api/products/${id}`, updateData);
      await deleteUnusedPhotosFromStorage(productData.id, storageEndpoint);
      showToast("Zdjęcia zostały dodane do produktu", "success");
      router.push(`/admin-panel/create-products/${urlEndpoint}`);
    } catch (err) {
      showToast("Nie udało się zapisać zmian w produkcie", "error");
    }
  };

  const handleReject = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/admin-panel/create-products/${urlEndpoint}`);
    showToast("Zmiany zostały odrzucone", "default");
  };

  const setNewPhotos =
    creationStage === "photos" ? setNewRawPhotos : setNewEditedPhotos;

  const oldPhotos = creationStage === "photos" ? rawPhotos : editedPhotos;

  return (
    <div>
      {colorVariants && colorVariants.length > 0 ? (
        colorVariants.map((variant, i) => (
          <Fragment key={i}>
            <h2 className="text-xl font-bold mb-4">
              Wariant kolorystyczny: {getColorVariantName(variant)}
            </h2>
            <ProductImagesUploader
              variant={variant}
              oldPhotos={oldPhotos || []}
              folderPath={`${folderPath}/${getColorVariantName(variant)}`}
              setNewPhotos={setNewPhotos}
              setIsUploading={(isStarting) => handleUploadChange(isStarting)}
            />
          </Fragment>
        ))
      ) : (
        <ProductImagesUploader
          oldPhotos={oldPhotos || []}
          setNewPhotos={setNewPhotos}
          folderPath={folderPath}
          setIsUploading={(isStarting) => handleUploadChange(isStarting)}
        />
      )}

      {isUploading && (
        <div className="my-4 w-full max-w-md">
          <MiniLoader />
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={isUploading}>
          Zapisz
        </Button>
        <Button onClick={handleReject} variant={"destructive"}>
          Odrzuć
        </Button>
      </div>
    </div>
  );
}
