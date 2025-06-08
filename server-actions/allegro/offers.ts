"use server";

import { PostOfferBody } from "@/app/api/allegro/offers/route";
import {
  AllegroOffer,
  AllegroOfferParameters,
} from "@/firebase/schemas/offersSchemas";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import { getAllegroAccessToken } from "./auth";
import { ALLEGRO_API_BASE_URL, getAllegroHeaders } from "./global";
import axios from "axios";
import { allegroSalesChannels } from "@/lib/constants";

type Primitive = string | number | boolean | string[] | number[];

export async function postAllegroOffer(data: PostOfferBody) {
  const { offer, productParameters, images, allegroCategoryId } = data;
  const allegroProductParameters =
    formatAllegroProductParameters(productParameters);
  const productSet = [
    {
      product: {
        name: offer.title,
        category: {
          id: allegroCategoryId,
        },
        parameters: allegroProductParameters,
        images: images,
      },
    },
  ];
  const allegroOfferData: Omit<AllegroOffer, "stock" | "description"> = {
    productSet,
    sellingMode: {
      price: {
        amount: offer.sellingPrices.AL1 as string,
        currency: "PLN",
      },
    },
    delivery: {
      handlingTime: "PT24H",
      shippingRates: {
        id: offer.shippingRates.AL1?.allegroId as string,
      },
    },
  };

  const accessToken = await getAllegroAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers`;
  const allegroHeaders = getAllegroHeaders(accessToken);
  const resp = await axios.post(url, allegroOfferData, {
    headers: allegroHeaders,
  });
}

export const formatAllegroProductParameters = (
  productParameters: ProductParameters
): AllegroOfferParameters => {
  const entries: [string, Primitive][] = [
    ...Object.entries(productParameters.required),
    ...Object.entries(productParameters.optional),
  ];

  return entries.map(([name, value]) => {
    let valuesArray: [Primitive, ...Primitive[]];

    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new Error(`Parameter "${name}" has an empty array of values.`);
      }
      valuesArray = [value[0], ...value.slice(1)];
    } else {
      valuesArray = [value];
    }

    return { name, values: valuesArray };
  });
};
