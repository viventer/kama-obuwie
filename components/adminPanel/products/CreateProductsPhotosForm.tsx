"use client";

import {
  Product,
  ProductWithId,
  RawPhoto,
} from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "./helpers/productsHelpers";
import ProductImagesUploader from "./ProductImagesUploader";
import { FormEvent, Fragment, useState } from "react";
import SubpageHeading from "../global/SubpageHeading";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteUnusedRawPhotosFromStorage } from "@/server-actions/images/images";

export default function CreateProductsPhotosForm({
  productData,
  samplePhotoUrl,
}: {
  productData: ProductWithId;
  samplePhotoUrl: string | null;
}) {
  const { id, colorVariants, rawPhotos, manufacturerCode } = productData;

  const folderPath = `products/raw-photos/obuwie/${id}`;

  const [newRawPhotos, setNewRawPhotos] = useState<RawPhoto[]>(rawPhotos || []);

  const { showToast } = useToast();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const updateData: Partial<Product> = {
      rawPhotos: newRawPhotos,
    };

    try {
      await axios.patch(`/api/products/${id}`, updateData);
      await deleteUnusedRawPhotosFromStorage(productData.id);
      showToast("Zdjęcia zostały dodane do produktu", "success");
      router.push("/admin-panel/create-products/photos");
    } catch (err) {
      showToast("Nie udało się zapisać zmian w produkcie", "error");
    }
  };

  const handleReject = (e: FormEvent) => {
    e.preventDefault();
    router.push("/admin-panel/create-products/photos");
    showToast("Zmiany zostały odrzucone", "default");
  };

  return (
    <div>
      <SubpageHeading text={`Dodaj zdjęcia do produktu`} />
      {samplePhotoUrl && (
        <section className="mb-8">
          <Image
            src={samplePhotoUrl}
            alt="Zdjęcie poglądowe"
            width={500}
            height={500}
            className="w-[10rem] aspect-square object-contain bg-primary/15 border-primary border-[0.1rem] border-solid rounded-sm mb-2"
          />
          <p className="font-bold">{manufacturerCode}</p>
        </section>
      )}
      {colorVariants && colorVariants.length > 0 ? (
        colorVariants.map((variant, i) => (
          <Fragment key={i}>
            <h2 className="text-xl font-bold mb-4">
              Wariant kolorystyczny: {getColorVariantName(variant)}
            </h2>
            <ProductImagesUploader
              variant={variant}
              oldPhotos={rawPhotos || []}
              folderPath={`${folderPath}/${getColorVariantName(variant)}`}
              setNewRawPhotos={setNewRawPhotos}
            />
          </Fragment>
        ))
      ) : (
        <ProductImagesUploader
          oldPhotos={rawPhotos || []}
          setNewRawPhotos={setNewRawPhotos}
          folderPath={folderPath}
        />
      )}
      <div className="flex gap-4">
        <Button onClick={handleSubmit}>Zapisz</Button>
        <Button onClick={handleReject} variant={"destructive"}>
          Odrzuć
        </Button>
      </div>
    </div>
  );
}
