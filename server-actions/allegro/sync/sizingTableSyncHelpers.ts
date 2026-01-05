import { adminDB } from "@/firebase/firebaseAdmin";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import type { Offer } from "@/firebase/schemas/offersSchemas";
import type {
  AllegroSizingTable,
  SizingTable,
  SizingTableWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import type { LegacyProduct } from "@/firebase/schemas/legacyProductsSchemas";
import { updateOffer } from "../../offers/offers";

export const transformAllegroSizingTableToSizingTable = (
  allegroTable: AllegroSizingTable
): SizingTable => {
  const insoleLengths: SizingTable["insoleLengths"] = [];
  const seen = new Set<string>();

  for (const row of allegroTable.values || []) {
    // Allegro zawsze zwraca: [rozmiar, długość wkładki]
    const size = (row.cells?.[1] || "").trim();
    const insoleStr = (row.cells?.[0] || "").trim().replace(",", ".");
    const insoleLength = Number.parseFloat(insoleStr);

    if (!size) continue;
    if (!Number.isFinite(insoleLength)) continue;
    if (seen.has(size)) continue;
    seen.add(size);

    insoleLengths.push({ size, insoleLength });
  }

  return {
    name: (allegroTable.name || "Tabela rozmiarów").slice(0, 32),
    insoleLengths,
    sizingAccuracy: "normalna",
    allegroId: allegroTable.id,
  };
};

export const addMissingSizesFromSizingTableToAvailability = (params: {
  availability: Offer["availability"] | undefined;
  sizingTableSizes: string[];
}): { nextAvailability: Offer["availability"]; addedCount: number } => {
  const { availability, sizingTableSizes } = params;

  const nextAvailability: Offer["availability"] = { ...(availability || {}) };
  let addedCount = 0;

  for (const rawSize of sizingTableSizes) {
    const size = (rawSize || "").trim();
    if (!size) continue;
    if (size in nextAvailability) continue;

    nextAvailability[size] = { value: "0" };
    addedCount++;
  }

  return { nextAvailability, addedCount };
};

export const fillAvailabilityFromSizingTableIfNeeded = async (params: {
  signature: string;
  existingOffer: Offer;
  matchingProducts: ProductWithId[];
  legacySizingTableId?: string;
  getOfferFromDBBySignature: (signature: string) => Promise<Offer | null>;
}): Promise<Offer> => {
  const {
    signature,
    existingOffer,
    matchingProducts,
    legacySizingTableId,
    getOfferFromDBBySignature,
  } = params;

  try {
    const productSizingTableId = matchingProducts.find(
      (p) =>
        typeof p.sizingTableId === "string" && p.sizingTableId.trim() !== ""
    )?.sizingTableId;

    let sizingTableIdToUse: string | undefined = productSizingTableId;
    if (!sizingTableIdToUse) {
      sizingTableIdToUse = legacySizingTableId;
    }

    if (!sizingTableIdToUse && existingOffer.legacyProductId) {
      const legacyDoc = await adminDB
        .collection("legacyProducts")
        .doc(existingOffer.legacyProductId)
        .get();
      const legacyData = legacyDoc.exists
        ? (legacyDoc.data() as LegacyProduct)
        : null;
      if (legacyData?.sizingTableId) {
        sizingTableIdToUse = legacyData.sizingTableId;
      }
    }

    if (!sizingTableIdToUse) {
      return existingOffer;
    }

    const { data: sizingData } =
      await getDocumentFromAdminDB<SizingTableWithId>(
        "sizingTables",
        sizingTableIdToUse
      );

    const sizesFromTable: string[] = Array.isArray(sizingData?.insoleLengths)
      ? sizingData.insoleLengths
          .map((x: SizingTable["insoleLengths"][number]) => x.size)
          .filter((x): x is string => Boolean(x))
      : [];

    const { nextAvailability, addedCount } =
      addMissingSizesFromSizingTableToAvailability({
        availability: existingOffer.availability,
        sizingTableSizes: sizesFromTable,
      });

    if (addedCount <= 0) {
      return existingOffer;
    }

    await updateOffer(existingOffer.id as string, {
      availability: nextAvailability,
    });

    return (await getOfferFromDBBySignature(signature)) || existingOffer;
  } catch (e) {
    console.warn(
      `⚠️  Failed to add missing sizes from sizing table for signature: ${signature}`,
      e
    );
    return existingOffer;
  }
};
