"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

type OffersByVariant = Record<string, OfferWithId>;

const extractOfferFromResponse = (
  payload: unknown,
  fallbackId: string,
): OfferWithId | null => {
  if (!payload || typeof payload !== "object") return null;

  const data = "data" in payload ? payload.data : payload;
  if (!data || typeof data !== "object") return null;

  return { ...(data as OfferWithId), id: fallbackId };
};

export function useLiveProductAvailability(bakedOffersData: OffersByVariant): {
  offersData: OffersByVariant;
  isRefreshing: boolean;
} {
  const [offersData, setOffersData] = useState<OffersByVariant>(bakedOffersData);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const entries = Object.entries(bakedOffersData).filter(
        ([, offer]) => Boolean(offer?.id),
      );

      if (entries.length === 0) {
        if (!cancelled) setIsRefreshing(false);
        return;
      }

      try {
        const results = await Promise.all(
          entries.map(async ([variantName, offer]) => {
            const response = await axios.get(`/api/offers/${offer.id}`);
            const fresh = extractOfferFromResponse(response.data, offer.id);
            return [variantName, fresh ?? offer] as const;
          }),
        );

        if (!cancelled) {
          setOffersData(Object.fromEntries(results));
        }
      } catch (error) {
        console.error(
          "Nie udało się odświeżyć dostępności produktu:",
          error,
        );
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };

    void refresh();

    return () => {
      cancelled = true;
    };
  }, [bakedOffersData]);

  return { offersData, isRefreshing };
}
