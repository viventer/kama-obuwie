"use client";

import {
  CategoryWithId,
  SizingTableWithId,
  ColorVariant,
  ProductParameters,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import ProductImagesSlider from "./ProductImagesSlider";
import SelectProductVariant from "./SelectProductVariant";
import SizingTableDialog from "./SizingTableDialog";
import { useEffect, useRef, useState } from "react";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TagIcon } from "lucide-react";
import AdvantagesBox from "./AdvantagesBox";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { useShoppingCart } from "@/app/providers/ShoppingCartProvider";
import { useToast } from "@/hooks/useToast";
import ShoppingCartPreviewItem from "../shopping-cart/ShoppingCartPreviewItem";
import ShippingInfo from "../global/ShippingInfo";
import { ShoppingCartItemType } from "@/firebase/schemas/shoppingCartSchemas";
import { analytics } from "@/firebase/firebase";
import { logEvent } from "firebase/analytics";
import { ItemType } from "@/firebase/schemas/analyticsSchemas";
import ProductPageSizeSelector from "./ProductPageSizeSelector";
import SelectSizeDialogContent from "./SelectSizeDialogContent";
import TrustmateWidget from "../global/TrustmateWidget";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import MobileProductPageShopAdvantages from "./MobileProductPageShopAdvantages";
import ReturnToListingButton from "./ReturnToListingButton";
import ProductInfo from "./ProductInfo";
import {
  connectedOfferData,
  StoreProductDataForStore,
} from "@/server-actions/store/getStoreProductPageData";

export type VariantToChoose = {
  name: string;
  imageUrl: string;
};

export default function ProductPage({
  imagesUrls,
  productData,
  category,
  initialColorVariantName,
  offersData,
  sizingTable,
  choosingSizeImageUrl,
  connectedOffers,
}: {
  imagesUrls: Record<string, string[]>;
  productData: StoreProductDataForStore;
  category: CategoryWithId;
  initialColorVariantName?: string;
  offersData: Record<string, OfferWithId>;
  sizingTable?: SizingTableWithId;
  choosingSizeImageUrl?: string;
  connectedOffers?: connectedOfferData[];
}) {
  const { currentBreakpoint } = useBreakpoint();
  const [filteredVariants, setFilteredVariants] = useState<VariantToChoose[]>(
    [],
  );

  if (!productData.colorVariants) {
    console.log(
      "Brak wariantów kolorystycznych dla produktu o ID:",
      productData.id,
    );
    notFound();
  }

  useEffect(() => {
    const availableVariants = productData.colorVariants.filter((variant) => {
      const variantName = getColorVariantName(variant);
      const offer = offersData[variantName];
      if (!offer || Object.keys(offer.availability).length === 0) return false;
      const isActive = Object.values(offer.availability).some(
        (availability) =>
          availability.value &&
          availability.value !== "" &&
          availability.value !== "0",
      );

      return isActive;
    });

    let variantsToChoose: VariantToChoose[] = availableVariants.map(
      (variant) => {
        const name = getColorVariantName(variant);
        const imageUrl = imagesUrls[name]?.[0];

        return {
          name,
          imageUrl,
        };
      },
    );

    const additionalVariants: VariantToChoose[] | undefined =
      connectedOffers?.map((offer) => ({
        name: offer.colorVariantName,
        imageUrl: offer.thumbnail,
      }));

    if (additionalVariants) {
      variantsToChoose = [...variantsToChoose, ...additionalVariants];
    }

    setFilteredVariants(variantsToChoose);

    if (analytics) {
      logEvent(analytics, "view_item", {
        items: [
          {
            item_id: offersData[selectedColorVariant]?.SKU || "none",
            item_name: offersData[selectedColorVariant]?.signature || "none",
            item_category: category.name,
            item_brand: productData.brand,
            price:
              Number(offersData[selectedColorVariant]?.sellingPrices?.DTC) ||
              50,
            size: selectedSize,
            quantity: 1,
            item_variant: selectedColorVariant,
          } as ItemType,
        ],
        value:
          Number(offersData[selectedColorVariant]?.sellingPrices?.DTC) || 50,
        currency: "PLN",
      });
    }
  }, []);

  const validInitialVariant =
    initialColorVariantName &&
    productData.colorVariants.some(
      (variant) => getColorVariantName(variant) === initialColorVariantName,
    )
      ? initialColorVariantName
      : getColorVariantName(productData.colorVariants[0]);

  const [selectedColorVariant, setSelectedColorVariant] =
    useState(validInitialVariant);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const selectedSizeRef = useRef<string>("");

  useEffect(() => {
    selectedSizeRef.current = selectedSize;
  }, [selectedSize]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = searchParams.get("colorVariantName") || undefined;
    if (!fromQuery) return;

    const isValid = productData.colorVariants.some(
      (variant) => getColorVariantName(variant) === fromQuery,
    );

    if (isValid) {
      setSelectedColorVariant(fromQuery);
      setSelectedSize("");
    }
  }, [searchParams, productData.colorVariants]);

  const handleVariantChange = (newVariant: string) => {
    if (imagesUrls[newVariant]) {
      setSelectedColorVariant(newVariant);
      setSelectedSize("");
      const params = new URLSearchParams(searchParams);
      params.set("colorVariantName", newVariant);
      router.replace(`/product/${productData.id}?${params.toString()}`, {
        scroll: false,
      });
    } else {
      const selectedOffer = connectedOffers?.find(
        (o) => o.colorVariantName === newVariant,
      );
      if (!selectedOffer || !selectedOffer?.offerId) {
        showToast("Nie udało się zmienić wariantu", "error");
        return;
      }

      router.push(`/product/${selectedOffer?.offerId}`);
    }
  };

  const currentOffer = offersData[selectedColorVariant];

  const priceStr =
    currentOffer?.sellingPrices?.DTC ||
    (currentOffer?.sellingPrices as any)?.AL1 ||
    (currentOffer?.sellingPrices as any)?.AL2 ||
    "0";
  const price = Number(priceStr) as number;

  const { openDialog, closeDialog } = useDialogWindow();
  const { addToCart, findExistingItem } = useShoppingCart();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    const sizeToAdd = selectedSizeRef.current;

    if (!sizeToAdd) {
      showToast("Proszę wybrać rozmiar", "error");
      return;
    }

    if (!currentOffer) {
      showToast("Oferta nie jest dostępna", "error");
      return;
    }

    if (analytics) {
      logEvent(analytics, "view_item", {
        items: [
          {
            item_id: offersData[selectedColorVariant]?.SKU || "none",
            item_name: offersData[selectedColorVariant]?.signature || "none",
            item_category: category.name,
            item_brand: productData.brand,
            price:
              Number(offersData[selectedColorVariant]?.sellingPrices?.DTC) ||
              50,
            size: selectedSize,
            quantity: 1,
            item_variant: selectedColorVariant,
          } as ItemType,
        ],
        value:
          Number(offersData[selectedColorVariant]?.sellingPrices?.DTC) || 50,
        currency: "PLN",
      });
    }

    // Sprawdź czy produkt już istnieje w koszyku
    const existingItem = findExistingItem(
      currentOffer.id,
      productData.id,
      sizeToAdd,
    );

    if (existingItem) {
      // Jeśli produkt już istnieje, wyświetl tylko informację
      showToast("Ten produkt już znajduje się w koszyku", "default");
    } else {
      // Dodaj nowy produkt do koszyka
      try {
        const item: ShoppingCartItemType["item"] = {
          offerId: currentOffer.id,
          productId: productData.id,
          thumbnailUrl: imagesUrls[selectedColorVariant][0],
          categoryName: category.name,
          brand:
            productData?.brand && productData.brand != "bez marki"
              ? productData.brand
              : "",
          price: price,
          size: sizeToAdd,
          formattedMainColor: selectedColorVariant,
          quantity: 1,
          isAvailable: true,
        };

        addToCart(item);

        openDialog({
          title: "Produkt dodany do koszyka",
          content: <ShoppingCartPreviewItem item={item} />,
          hasCancelButton: true,
          cancelText: "Kontynuuj zakupy",
          confirmText: "Przejdź do koszyka",
          onConfirm: () => router.push("/shopping-cart"),
          confirmVariant: "important",
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        showToast("Wystąpił błąd podczas dodawania do koszyka", "error");
      }
    }
  };

  const showSizingTable = () => {
    if (!sizingTable) return;

    openDialog({
      title: "Tabela rozmiarów",
      content: (
        <SizingTableDialog
          sizingTable={sizingTable}
          choosingSizeImageUrl={choosingSizeImageUrl}
        />
      ),
      hasCancelButton: false,
    });
  };

  return (
    <>
      <ReturnToListingButton category={category} className="mb-2 md:mb-3" />
      <div className="flex flex-col gap-4 md:flex-row sm:gap-8">
        <div className="flex flex-col gap-8 flex-0">
          <ProductImagesSlider imagesUrls={imagesUrls[selectedColorVariant]} />
          <ProductInfo className="hidden md:flex" productData={productData} />
        </div>
        <div className="flex flex-col gap-2 w-full flex-1">
          {productData?.brand && productData.brand != "bez marki" && (
            <h2 className="capitalize font-bold text-xl text-text md:text-2xl md:bg-primary md:px-4 md:py-2 md:rounded-xs md:flex md:flex-col md:mb-4 md:text-white">
              {category.name}
              <span className="font-normal">
                {" "}
                {productData.brand} {productData.manufacturerCode}
              </span>
            </h2>
          )}
          <div className="border-2 border-success w-fit px-4 py-2 rounded-xs flex gap-2 items-center mb-4">
            <TagIcon className="text-success size-5 md:size-6" />
            <p className="text-xl md:text-2xl font-medium">
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
                minimumFractionDigits: 2,
              }).format(price)}
            </p>
          </div>
          <div className="w-full flex flex-col gap-4">
            <SelectProductVariant
              colorVariants={filteredVariants}
              selectedColorVariant={selectedColorVariant}
              onVariantChange={handleVariantChange}
            />
            <section>
              {currentOffer && currentOffer.availability && (
                <section>
                  <h3 className="text-lg font-medium"> Rozmiar</h3>
                  <ProductPageSizeSelector
                    availability={currentOffer.availability}
                    selectedSize={selectedSize}
                    onSizeChange={setSelectedSize}
                  />
                </section>
              )}
              {sizingTable && (
                <Button
                  variant={"outline"}
                  className="w-fit"
                  onClick={showSizingTable}
                >
                  Tabela rozmiarów
                </Button>
              )}
            </section>
            <article>
              <Button
                className="w-full md:max-w-[300px] text-xl font-bold px-8 py-6 bg-primary text-white hover:brightness-125 hover:bg-primary mb-2"
                onClick={() => {
                  if (selectedSize) {
                    handleAddToCart();
                    return;
                  }
                  openDialog({
                    title: "Wybierz rozmiar",
                    content: (
                      <SelectSizeDialogContent
                        availability={currentOffer?.availability}
                        selectedSize={selectedSize}
                        onSizeChange={setSelectedSize}
                      />
                    ),
                    hasCancelButton: false,
                    confirmText: "Dodaj do koszyka",
                    onConfirm: () => {
                      // Najpierw zamknij bieżący dialog. Provider czyści config po ~200ms,
                      // więc otwarcie kolejnego dialogu musi poczekać, żeby nie został nadpisany.
                      closeDialog();
                      setTimeout(() => {
                        handleAddToCart();
                      }, 250);
                    },
                    confirmVariant: "important",
                  });
                }}
              >
                Dodaj do koszyka
              </Button>
              <ShippingInfo />
              {currentBreakpoint && currentBreakpoint.includes("s") ? (
                <>
                  <TrustmateWidget className="mt-8 mb-4 bg-card rounded-xs" />
                  <MobileProductPageShopAdvantages className="mb-4" />
                </>
              ) : (
                <>
                  <TrustmateWidget
                    className="mt-8 mb-4 bg-card rounded-xs"
                    alignActionEnd
                  />
                  <AdvantagesBox className="h-fit flex-0" />
                </>
              )}
            </article>
            <ProductInfo className="md:hidden" productData={productData} />
          </div>
        </div>
      </div>
    </>
  );
}
