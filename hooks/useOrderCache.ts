import { useState, useEffect, useRef } from "react";
import { getOrderByAllegroId } from "@/server-actions/orders/orders";
import { ReturnOffer } from "@/components/adminPanel/returns/tables/ReturnItemsDisplay";

// Cache dla przechowywania danych zamówień
const orderCache = new Map<string, ReturnOffer[]>();

export function useOrderOffers(allegroOrderId: string) {
  const [orderOffers, setOrderOffers] = useState<ReturnOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchOrderOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sprawdzamy cache najpierw
        if (orderCache.has(allegroOrderId)) {
          const cachedOffers = orderCache.get(allegroOrderId)!;
          if (isMountedRef.current && !isCancelled) {
            setOrderOffers(cachedOffers);
            setLoading(false);
          }
          return;
        }

        // Jeśli nie ma w cache, pobieramy dane
        const order = await getOrderByAllegroId(allegroOrderId);

        if (isCancelled) return;

        if (!order) {
          const errorMsg = `Order not found for Allegro ID: ${allegroOrderId}`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        const offers: ReturnOffer[] = order.lineItems.map((item) => ({
          thumbnail: item.offer.thumbnail,
          allegroId: item.offer.allegroId,
          signature: item.offer.signature,
        }));

        // Zapisujemy do cache
        orderCache.set(allegroOrderId, offers);

        if (isMountedRef.current && !isCancelled) {
          setOrderOffers(offers);
        }
      } catch (err) {
        if (isMountedRef.current && !isCancelled) {
          const errorMsg =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMsg);
          console.error("Error fetching order offers:", err);
        }
      } finally {
        if (isMountedRef.current && !isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrderOffers();

    return () => {
      isCancelled = true;
    };
  }, [allegroOrderId]);

  return { orderOffers, loading, error };
}

// Funkcja do czyszczenia cache (opcjonalna, do użycia gdy potrzebne)
export function clearOrderCache(allegroOrderId?: string) {
  if (allegroOrderId) {
    orderCache.delete(allegroOrderId);
  } else {
    orderCache.clear();
  }
}
