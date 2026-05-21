import { Form } from "@/components/ui/form";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { FormEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import AvailabilityField from "./forms/AvailabilityField";
import { allegroSalesChannels } from "@/lib/constants";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { useFullPageLoading } from "../global/FullPageLoader";
import { Button } from "@/components/ui/button";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { validateAvailability } from "./helpers/validation";

export default function ChangeAvailabilityDialogContent({
  offerId,
  availability,
  allegroOffersIds,
  isAddedToMerchantCenter,
}: {
  offerId: string;
  availability: OfferWithId["availability"];
  allegroOffersIds: OfferWithId["allegroOffersIds"];
  isAddedToMerchantCenter: boolean;
}) {
  const form = useForm<OfferWithId["availability"]>({
    defaultValues: availability,
    mode: "onChange",
  });

  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();
  const { closeDialog } = useDialogWindow();

  const sizes = Object.keys(availability);
  useEffect(() => {
    sizes.forEach((size) => {
      const current = form.getValues(`${size}.value`);
      if (current == null) {
        form.setValue(`${size}.value`, "1");
      }
    });
  }, []);

  const updateAllegroOffers = async (formData: OfferWithId["availability"]) => {
    const validationResult = validateAvailability(formData, "edit");
    if (validationResult && !validationResult.isValid) {
      showToast(validationResult.message, "error");
      return;
    }
    const availabilityMap = formData;
    const sizesToProcess = Object.keys(availabilityMap);

    const updatePromises = allegroSalesChannels.flatMap((salesChannel) => {
      const offersIds =
        (allegroOffersIds?.[salesChannel] as Record<string, string>) || {};

      return sizesToProcess.map(async (size) => {
        const availability = Number(form.getValues(`${size}.value`));

        const offerPartial = {
          stock: {
            available: availability || 0,
            unit: "PAIR",
          },
          publication: {
            status: availability > 0 ? "ACTIVE" : "ENDED",
          },
        };

        const existingOfferId = offersIds[size];

        // Dla AL2 nie tworzymy ofert – tylko edytujemy, jeśli istnieją.
        if (salesChannel === "AL2" && !existingOfferId) {
          return;
        }

        const createOffer = async (): Promise<string> => {
          const { data } = await axios.post("/api/allegro/offers/individual", {
            offerId,
            size,
            salesChannel,
          });
          return data.allegroOfferId as string;
        };

        let offerIdToUpdate = existingOfferId || (await createOffer());

        try {
          await axios.patch(`/api/allegro/offers/${offerIdToUpdate}`, {
            offerPartial,
            salesChannel,
          });
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 404) {
            if (salesChannel === "AL2") {
              return;
            }
            offerIdToUpdate = await createOffer();
            await axios.patch(`/api/allegro/offers/${offerIdToUpdate}`, {
              offerPartial,
              salesChannel,
            });
            return;
          }

          throw err;
        }
      });
    });

    await Promise.all(updatePromises);
  };

  const updateOfferInDB = async (formData: OfferWithId["availability"]) => {
    await axios.patch(`/api/offers/${offerId}`, { availability: formData });
  };

  const updateOfferInMerchantCenter = async () => {
    try {
      await axios.patch(`/api/merchant-center/offer/${offerId}`);
    } catch (err) {
      showToast(
        `Błąd podczas aktualizacji oferty o id ${offerId} w Merchant Center.`,
        "error",
      );
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();
    const formData = form.getValues();
    try {
      await updateOfferInDB(formData);
    } catch (err) {
      showToast("Błąd podczas aktualizacji oferty w bazie danych", "error");
      stopLoading();
      return;
    }

    if (isAddedToMerchantCenter) {
      try {
        await updateOfferInMerchantCenter();
      } catch (err) {
        showToast(
          "Błąd podczas aktualizacji oferty w Merchant Center",
          "error",
        );
        stopLoading();
        return;
      }
    }

    try {
      await updateAllegroOffers(formData);
      showToast("Dostępność została zaktualizowana", "success");
    } catch (err) {
      showToast("Błąd podczas aktualizacji ofert na Allegro", "error");
    } finally {
      stopLoading();
    }
  };

  return (
    <Form {...form}>
      <AvailabilityField
        sizes={sizes}
        mode={"edit"}
        namePrefix={""}
        isModal={true}
      />
      <div className="flex mt-2 gap-4">
        <Button onClick={(e) => handleSubmit(e)} className="w-fit">
          Zapisz
        </Button>
        <Button
          onClick={(e) => closeDialog()}
          className="w-fit"
          variant="destructive"
        >
          Odrzuć
        </Button>
      </div>
    </Form>
  );
}
