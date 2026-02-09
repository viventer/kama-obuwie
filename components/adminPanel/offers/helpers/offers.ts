import { AllegroOffer, OfferWithId } from "@/firebase/schemas/offersSchemas";

export function convertOfferPartialToAllegroOfferPartial(
  offerFragment: Partial<OfferWithId>,
  salesChannel: "AL1" | "AL2",
): Partial<AllegroOffer> {
  const allegroOffer: Partial<AllegroOffer> = {};

  if (offerFragment.sellingPrices?.[salesChannel]) {
    allegroOffer.sellingMode = {
      price: {
        amount: offerFragment.sellingPrices[salesChannel],
        currency: "PLN",
      },
    };
  } else {
    throw new Error(`Brak ceny sprzedaży dla kanału ${salesChannel}`);
  }

  if (offerFragment.shippingRates?.[salesChannel]?.allegroId) {
    allegroOffer.delivery = {
      shippingRates: {
        id: offerFragment.shippingRates[salesChannel].allegroId,
      },
    };
  } else {
    throw new Error(`Brak stawek wysyłki dla kanału ${salesChannel}`);
  }

  const afterSalesServices: AllegroOffer["afterSalesServices"] = {
    impliedWarranty: { id: "" },
    returnPolicy: { id: "" },
  };

  if (offerFragment.returnPolicy?.[salesChannel]) {
    afterSalesServices.returnPolicy = {
      id: offerFragment.returnPolicy[salesChannel],
    };
  } else {
    throw new Error(`Brak polityki zwrotów dla kanału ${salesChannel}`);
  }

  if (offerFragment.impliedWarranty?.[salesChannel]) {
    afterSalesServices.impliedWarranty = {
      id: offerFragment.impliedWarranty[salesChannel],
    };
  } else {
    throw new Error(`Brak warunków reklamacji dla kanału ${salesChannel}`);
  }

  if (offerFragment.warranty?.[salesChannel]) {
    afterSalesServices.warranty = {
      id: offerFragment.warranty[salesChannel],
    };
  }

  allegroOffer.afterSalesServices = afterSalesServices;

  return allegroOffer;
}
