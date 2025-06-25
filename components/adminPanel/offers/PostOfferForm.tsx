"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PostOfferFormSchema,
  Offer,
  OfferWithId,
} from "@/firebase/schemas/offersSchemas";
import {
  OffersIds,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SellingPricesField from "./SellingPricesField";
import ShippingRatesSelector from "./ShippingRatesSelector";
import AvailabilityField from "./AvailabilityField";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { PostOfferBody } from "@/app/api/allegro/offers/route";
import { getPostOfferBody } from "@/server-actions/offers/offers";
import { getColorVariantName } from "../products/helpers/productsHelpers";
import { getImagesUrls } from "@/server-actions/images/images";
import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { useRouter } from "next/navigation";
import Loader from "../global/Loader";
import MiniLoader from "../global/MiniLoader";

export type PostOfferFormValues = Pick<
  Offer,
  "title" | "sellingPrices" | "shippingRates" | "availability"
>;

export default function PostOfferForm({
  oldOfferData,
  productData,
}: {
  oldOfferData: OfferWithId;
  productData: ProductWithId;
}) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizingTable, setSizingTable] = useState<SizingTableWithId | null>(
    null
  );
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data }: { data: SizingTableWithId } = await axios.get(
        `/api/sizing-tables/${productData.sizingTableId}`
      );
      const respSizes = data.insoleLengths.map((item) => item.size.toString());
      setSizes(respSizes);
      setSizingTable(data);

      respSizes.forEach((size) => {
        const current = form.getValues(`availability.${size}.value`);
        if (current == null) {
          form.setValue(`availability.${size}.value`, "1");
        }
      });
    })();
  }, [productData.sizingTableId]);

  const form = useForm<PostOfferFormValues>({
    resolver: zodResolver(PostOfferFormSchema),
    defaultValues: {
      title: oldOfferData.title || "",
      sellingPrices: oldOfferData.sellingPrices || {},
      shippingRates: oldOfferData.shippingRates || {},
      availability: oldOfferData.availability || {},
    },
  });

  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    const formData = form.getValues();
    const isValid = await validateForm();
    if (!isValid) {
      setIsPosting(false);
      return;
    }
    if (!sizingTable) {
      showToast("Tabela rozmiarów nie została załadowana", "error");
      setIsPosting(false);
      return false;
    }

    if (!productData.colorVariants || productData.colorVariants.length === 0) {
      showToast("Produkt nie ma wariantów kolorystycznych", "error");
      setIsPosting(false);
      return;
    }

    const colorVariantsNames = productData.colorVariants?.map((variant) =>
      getColorVariantName(variant)
    );
    const signatureWithoutColorVariant = `${
      productData.brand ? productData.brand : ""
    } ${productData.manufacturerCode}`;
    const offersIds: OffersIds = {
      AL1: [
        {
          value: oldOfferData.id,
          colorVariantName: colorVariantsNames[0],
        },
      ],
    };

    try {
      await updateMainOffer({
        ...oldOfferData,
        ...formData,
        colorVariantName: colorVariantsNames[0],
        signature:
          signatureWithoutColorVariant.trim() + ` ${colorVariantsNames[0]}`,
      });

      for (const colorVariantName of colorVariantsNames) {
        if (colorVariantName === colorVariantsNames[0]) {
          continue;
        }
        const id = await createOfferForDifferentVariant({
          ...oldOfferData,
          ...formData,
          colorVariantName,
          signature:
            signatureWithoutColorVariant.trim() + ` ${colorVariantName}`,
        });
        offersIds?.AL1?.push({
          value: id,
          colorVariantName,
        });
      }

      const postAllegroOfferBody: Omit<
        PostOfferBody,
        "colorVariant" | "images"
      > = await getPostOfferBody({
        formData,
        productData,
        oldOfferData,
        sizingTable,
      });

      for (const variant of productData.colorVariants) {
        if (!productData.editedPhotos) {
          showToast("Brak zdjęć produktu", "error");
          continue;
        }

        const colorVariantName = getColorVariantName(variant);

        const imagesOfVariant = productData.editedPhotos.filter(
          (image) => image.colorVariantName === colorVariantName
        );

        const imagesPaths = imagesOfVariant.map((image) => image.filePath);

        const imagesUrls = await getImagesUrls(imagesPaths);

        const { data } = await axios.post("/api/allegro/offers", {
          ...postAllegroOfferBody,
          colorVariant: variant,
          images: imagesUrls,
        });

        const formattedAllegroIds = {
          AL1: data.allegroIds,
        };

        const offerId = offersIds?.AL1?.find(
          (offer) => offer.colorVariantName === colorVariantName
        )?.value;

        await axios.patch(`/api/offers/${offerId}`, {
          allegroOffersIds: formattedAllegroIds,
        });

        await axios.patch(`/api/products/${productData.id}`, {
          offersIds,
          creationStage: "done",
        });
      }

      setIsPosting(false);
      showToast("Oferta została wystawiona.", "success");
      router.replace("/admin-panel/create-products/post-offer");
    } catch (err) {
      showToast(`Nie udało się wystawić oferty: ${err}`, "error");
      setIsPosting(false);
      return;
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const isValid = await form.trigger();
    if (!isValid) {
      showToast("Formularz zawiera błędy", "error");
      return false;
    }

    return true;
  };

  const updateMainOffer = async (offerData: Offer) => {
    try {
      await axios.patch(`/api/offers/${oldOfferData.id}`, offerData);
    } catch (err) {
      throw new Error(`Nie można zaktualizować głównej oferty: ${err}`);
    }
  };

  const createOfferForDifferentVariant = async (
    offerData: Offer
  ): Promise<string> => {
    try {
      const { data } = await axios.post("/api/offers", {
        ...offerData,
      });
      return data.id;
    } catch (err) {
      throw new Error(`Nie można utworzyć oferty dla wariantu: ${err}`);
    }
  };

  const { showDialog } = useConfirmDialog();
  const router = useRouter();
  const handleReject = async (e: FormEvent) => {
    e.preventDefault();

    showDialog({
      message: "Czy na pewno chcesz odrzucić zmiany?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        router.back();
        showToast("Zmiany zostały odrzucone.", "default");
      },
    });
  };

  if (isPosting) {
    return <MiniLoader />;
  }

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <FormField
          rules={{ required: "Tytuł oferty jest wymagany." }}
          control={form.control}
          name={"title" as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł oferty</FormLabel>
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
                maxLength={72}
              />
            </FormItem>
          )}
        />
        <SellingPricesField />
        <ShippingRatesSelector />
        <AvailabilityField sizes={sizes} />
      </div>
      <div className="flex mt-8 gap-4">
        <Button onClick={(e) => handleSubmit(e)} className="w-fit">
          Zapisz
        </Button>
        <Button
          onClick={(e) => handleReject(e)}
          className="w-fit"
          variant="destructive"
        >
          Odrzuć
        </Button>
      </div>
    </Form>
  );
}
