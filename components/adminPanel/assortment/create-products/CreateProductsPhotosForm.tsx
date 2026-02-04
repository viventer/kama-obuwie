"use client";

import {
  EditedPhoto,
  EditedPhotoWithUrl,
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
import {
  deleteUnusedPhotosFromStorage,
  getImageUrl,
  getImagesUrls,
} from "@/server-actions/files/files";
import { useProductTypeContext } from "../ProductsTypeContext";
import MiniLoader from "../../global/MiniLoader";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { choosingSizeImageFilePath } from "@/lib/constants";

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
    editedPhotos || [],
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

  const { handleError } = useErrorHandler();

  const editAllegroOffersPhotos = async (
    newEditedPhotos: EditedPhotoWithUrl[],
  ) => {
    try {
      if (!productData?.SKU) {
        showToast("Brak danych SKU dla produktu", "error");
        return;
      }

      // 1. Pobierz oferty z bazy danych poprzez SKU
      const offers: OfferWithId[] = [];
      for (const colorVariantName in productData.SKU) {
        const SKU = productData.SKU[colorVariantName];
        try {
          const response = await axios.get(`/api/offers?SKU=${SKU}`);
          const offerData = Object.values(response.data)[0] as OfferWithId;
          if (offerData) {
            offers.push(offerData);
          }
        } catch (error) {
          showToast(`Nie znaleziono oferty dla SKU: ${SKU}`, "error");
          return;
        }
      }

      if (offers.length === 0) {
        showToast("Nie znaleziono ofert dla tego produktu", "error");
        return;
      }

      // 2. Edytuj zdjęcia dla wszystkich ofert na Allegro
      for (const offer of offers) {
        if (!offer.allegroOffersIds) continue;

        // Znajdź odpowiedni wariant kolorystyczny
        const colorVariant = productData.colorVariants?.find(
          (variant) =>
            getColorVariantName(variant) ===
            Object.keys(productData.SKU!).find(
              (key) => productData.SKU![key] === offer.SKU,
            ),
        );

        if (!colorVariant) continue;

        // Przygotuj zdjęcia dla tego wariantu kolorystycznego
        const colorVariantName = getColorVariantName(colorVariant);
        const variantPhotos = newEditedPhotos.filter(
          (photo) => photo.colorVariantName === colorVariantName,
        );

        if (variantPhotos.length === 0) {
          showToast(
            `Brak zdjęć dla wariantu kolorystycznego: ${colorVariantName}`,
            "error",
          );
          return;
        }

        // Pobierz URLs zdjęć
        const imageUrls: string[] = [];
        for (const photo of variantPhotos) {
          if (photo.url) {
            imageUrls.push(photo.url);
          } else if (photo.filePath) {
            try {
              const imageUrl = await getImageUrl(photo.filePath);
              if (imageUrl) {
                imageUrls.push(imageUrl);
              } else {
                showToast(
                  `Nie udało się pobrać URL dla zdjęcia: ${photo.filePath}`,
                  "error",
                );
                return;
              }
            } catch (error) {
              showToast(
                `Błąd podczas pobierania URL dla zdjęcia: ${photo.filePath}`,
                "error",
              );
              return;
            }
          }
        }

        // Update offer.thumbnail
        try {
          const thumbnailUrl = imageUrls[0];
          if (thumbnailUrl) {
            await axios.patch(`/api/offers/${offer.id}`, {
              thumbnail: thumbnailUrl,
            });
            console.log(thumbnailUrl);
          }
        } catch (error) {
          showToast(
            `Nie udało się podmienić miniaturki dla oferty: ${offer.id}.`,
            "error",
          );
          return;
        }

        // Dodaj zdjęcie wyboru rozmiaru na końcu
        try {
          const sizingImageUrl = await getImageUrl(choosingSizeImageFilePath);
          if (sizingImageUrl) {
            imageUrls.push(sizingImageUrl);
          } else {
            showToast("Nie udało się pobrać zdjęcia wyboru rozmiaru", "error");
            return;
          }
        } catch (error) {
          showToast("Błąd podczas pobierania zdjęcia wyboru rozmiaru", "error");
          return;
        }

        if (imageUrls.length === 0) {
          showToast(
            `Brak dostępnych URL-ów zdjęć dla wariantu: ${colorVariantName}`,
            "error",
          );
          return;
        }

        const updateData = {
          images: imageUrls,
        };

        // Pobierz wszystkie rozmiary dla tego wariantu kolorystycznego
        const AL1Offers = offer.allegroOffersIds.AL1 || {};
        const AL2Offers = offer.allegroOffersIds.AL2 || {};

        const allSizes = new Set([
          ...Object.keys(AL1Offers),
          ...Object.keys(AL2Offers),
        ]);

        // Edytuj wszystkie rozmiary równolegle
        const editPromises: Promise<any>[] = [];

        for (const size of allSizes) {
          // Edytuj oferty na obu kontach
          if (AL1Offers[size]) {
            editPromises.push(
              axios.patch(`/api/allegro/offers/${AL1Offers[size]}`, {
                offerPartial: updateData,
                salesChannel: "AL1",
              }),
            );
          }

          if (AL2Offers[size]) {
            editPromises.push(
              axios.patch(`/api/allegro/offers/${AL2Offers[size]}`, {
                offerPartial: updateData,
                salesChannel: "AL2",
              }),
            );
          }
        }

        // Wykonaj wszystkie edycje równolegle dla tego wariantu kolorystycznego
        try {
          await Promise.all(editPromises);
        } catch (error) {
          handleError(
            error,
            `Błąd podczas edycji zdjęć dla wariantu ${colorVariantName}`,
          );
          showToast(
            `Błąd podczas edycji zdjęć dla wariantu ${colorVariantName}`,
            "error",
          );
        }
      }

      showToast("Zdjęcia ofert Allegro zostały zaktualizowane", "success");
    } catch (error) {
      handleError(error, `Błąd podczas edycji zdjęć Allegro`);
    }
  };

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

    if (creationStage === "done") {
      // Pobierz wszystkie URLs za jednym razem przez getImagesUrls
      const filePaths = newEditedPhotos.map((photo) => photo.filePath);

      try {
        const urls = await getImagesUrls(filePaths);

        if (!urls) {
          showToast("Nie udało się pobrać URL-ów dla zdjęć", "error");
          return;
        }

        // Przekonwertuj EditedPhoto[] na EditedPhotoWithUrl[]
        const editedPhotosWithUrls: EditedPhotoWithUrl[] = newEditedPhotos.map(
          (photo, index) => ({
            ...photo,
            url: urls[index],
          }),
        );

        await editAllegroOffersPhotos(editedPhotosWithUrls);
      } catch (error) {
        showToast("Błąd podczas pobierania URL-ów zdjęć", "error");
        return;
      }
    }

    try {
      await axios.patch(`/api/products/${id}`, updateData);
      await deleteUnusedPhotosFromStorage(productData.id, storageEndpoint);
      showToast("Zdjęcia zostały dodane do produktu", "success");
      if (creationStage === "done") {
        router.push("/admin-panel/products");
      } else {
        router.push(`/admin-panel/create-products/${urlEndpoint}`);
      }
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
