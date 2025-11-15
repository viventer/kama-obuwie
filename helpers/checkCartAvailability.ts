import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { ShoppingCartItemType } from "@/firebase/schemas/shoppingCartSchemas";
import axios from "axios";

/**
 * Fetches offer data for all unique offer IDs in the cart
 */
export async function fetchOffersData(
  cart: ShoppingCartItemType[],
  existingOffersData: Record<string, OfferWithId> = {}
): Promise<Record<string, OfferWithId>> {
  if (cart.length === 0) {
    return {};
  }

  const uniqueOfferIds = [...new Set(cart.map((item) => item.item.offerId))];

  const missingOfferIds = uniqueOfferIds.filter(
    (offerId) => !existingOffersData[offerId]
  );

  if (missingOfferIds.length === 0) {
    return existingOffersData;
  }

  try {
    const offersPromises = missingOfferIds.map(async (offerId) => {
      const response = await axios.get(`/api/offers/${offerId}`);
      return { id: offerId, ...response.data.data };
    });

    const newOffers: OfferWithId[] = await Promise.all(offersPromises);

    const newOffersMap = newOffers.reduce((acc, offer) => {
      acc[offer.id] = offer;
      return acc;
    }, {} as Record<string, OfferWithId>);

    return { ...existingOffersData, ...newOffersMap };
  } catch (error) {
    console.error("Error fetching offers data:", error);
    throw new Error("Wystąpił błąd podczas pobierania danych produktów");
  }
}

/**
 * Checks availability of cart items and updates their availability status
 * Returns object with availability status and list of unavailable items
 */
export function checkCartItemsAvailability(
  cart: ShoppingCartItemType[],
  offersData: Record<string, OfferWithId>,
  updateItemAvailability: (itemId: string, isAvailable: boolean) => void
): {
  hasUnavailable: boolean;
  unavailableItems: Array<{
    id: string;
    name: string;
    size: string;
    requestedQuantity: number;
    availableQuantity: number;
  }>;
} {
  const unavailableItems: Array<{
    id: string;
    name: string;
    size: string;
    requestedQuantity: number;
    availableQuantity: number;
  }> = [];

  for (const cartItem of cart) {
    const offer = offersData[cartItem.item.offerId];
    if (offer && offer.availability[cartItem.item.size]) {
      const availableQuantity = parseInt(
        offer.availability[cartItem.item.size].value || "0"
      );
      const isAvailable = availableQuantity >= cartItem.item.quantity;

      // Update availability status
      updateItemAvailability(cartItem.id, isAvailable);

      // Track unavailable items
      if (!isAvailable) {
        unavailableItems.push({
          id: cartItem.id,
          name: `${cartItem.item.categoryName} ${cartItem.item.brand || ""}`,
          size: cartItem.item.size,
          requestedQuantity: cartItem.item.quantity,
          availableQuantity: availableQuantity,
        });
      }
    }
  }

  return {
    hasUnavailable: unavailableItems.length > 0,
    unavailableItems,
  };
}
