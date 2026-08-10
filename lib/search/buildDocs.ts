import { getDocumentsFromAdminDB } from "@/firebase/getters";
import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { getCategoryDisplayName } from "@/helpers/categories";
import { ParamValueSchema } from "@/firebase/schemas/productsSchemas";
import { z } from "zod";
import {
  chunkArray,
  collectOfferIdsFromProducts,
  getLegacyOffersByLegacyProductIds,
  getOffersByDocumentIds,
  transformLegacyOfferToListingJoinContext,
  transformProductToListingJoinContext,
} from "@/lib/products/listingJoins";
import { getSynonymTagsForText } from "@/lib/search/synonyms";
import {
  FacetLexicon,
  isShoeRootCategory,
  SearchDoc,
  SHOE_ROOT_CATEGORIES,
} from "@/lib/search/types";
import { normalizeForSearch } from "@/helpers/text";

type ParamValue = z.infer<typeof ParamValueSchema>;

const flattenParamValues = (value: ParamValue): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "boolean") {
    return value ? ["Tak"] : ["Nie"];
  }
  const str = String(value).trim();
  return str ? [str] : [];
};

const collectParamsText = (
  parameters: ProductWithId["parameters"] | undefined,
): string[] => {
  if (!parameters) return [];
  const values: string[] = [];
  for (const value of Object.values(parameters.required || {})) {
    values.push(...flattenParamValues(value));
  }
  for (const value of Object.values(parameters.optional || {})) {
    values.push(...flattenParamValues(value));
  }
  return values;
};

export const buildFacetLexicon = (docs: SearchDoc[]): FacetLexicon => {
  const colors = new Map<string, string>();
  const fastenings = new Map<string, string>();
  const materials = new Map<string, string>();
  const categories = new Map<string, string>();
  const features = new Map<string, string>();

  for (const doc of docs) {
    if (doc.filters?.color) {
      colors.set(normalizeForSearch(doc.filters.color), doc.filters.color);
    }
    for (const part of doc.colorText.split(/\s+/).filter(Boolean)) {
      colors.set(normalizeForSearch(part), part);
    }
    for (const f of doc.filters?.fastening || []) {
      fastenings.set(normalizeForSearch(f), f);
    }
    for (const m of doc.filters?.externalMaterial || []) {
      materials.set(normalizeForSearch(m), m);
    }
    if (doc.categoryName) {
      categories.set(normalizeForSearch(doc.categoryName), doc.categoryName);
    }
    for (const feature of doc.features) {
      features.set(normalizeForSearch(feature), feature);
    }
  }

  return { colors, fastenings, materials, categories, features };
};

export const buildSearchDocs = async (): Promise<SearchDoc[]> => {
  const categories =
    (await getDocumentsFromAdminDB<CategoryWithId>("categories")) ?? [];

  const shoeCategories = categories.filter((c) =>
    isShoeRootCategory(c.rootCategory),
  );
  const categoryById = new Map(
    shoeCategories.map((c) => [c.id, c] as const),
  );
  const shoeCategoryIds = shoeCategories.map((c) => c.id);

  if (shoeCategoryIds.length === 0) {
    return [];
  }

  // Fetch all products for shoe categories in chunks of 10 (Firestore `in` limit)
  const productChunks = chunkArray(shoeCategoryIds, 10);
  const productsArrays = await Promise.all(
    productChunks.map(
      (chunk) =>
        getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
          ref.where("categoryId", "in", chunk),
        ) ?? [],
    ),
  );
  const products = productsArrays.flat().filter(Boolean) as ProductWithId[];

  const offerIds = collectOfferIdsFromProducts(products);
  const offers = await getOffersByDocumentIds(offerIds);
  const offerById = new Map(offers.map((o) => [o.id, o]));

  const legacyProducts =
    (
      await Promise.all(
        productChunks.map(
          (chunk) =>
            getDocumentsFromAdminDB<LegacyProductWithId>(
              "legacyProducts",
              (ref) => ref.where("categoryId", "in", chunk),
            ) ?? [],
        ),
      )
    )
      .flat()
      .filter(Boolean) as LegacyProductWithId[];

  const legacyById = new Map(legacyProducts.map((l) => [l.id, l] as const));
  const legacyOffersAll = await getLegacyOffersByLegacyProductIds(
    Array.from(legacyById.keys()),
  );
  const legacyOffers = legacyOffersAll.filter(
    (offer) => !offer.productId && offer.legacyProductId,
  );

  const docs: SearchDoc[] = [];

  for (const product of products) {
    if (
      product.rootCategory &&
      !SHOE_ROOT_CATEGORIES.includes(product.rootCategory)
    ) {
      continue;
    }
    const category = product.categoryId
      ? categoryById.get(product.categoryId)
      : undefined;
    if (!category) continue;

    const contexts = await transformProductToListingJoinContext(
      product,
      offerById,
    );

    for (const ctx of contexts) {
      if (!ctx.listing.isActive) continue;

      const paramsText = collectParamsText(ctx.parameters);
      const features = ctx.features || [];
      const colorText = ctx.colorParts.join(" ");
      const categoryName = category.name;
      const categoryDisplayName = getCategoryDisplayName(category);
      const tags = getSynonymTagsForText([
        ctx.title,
        categoryName,
        categoryDisplayName,
        ...features,
      ]);

      docs.push({
        ...ctx.listing,
        categoryId: category.id,
        rootCategory: category.rootCategory,
        docId: `${ctx.listing.id}-${ctx.listing.colorVariantName}`,
        title: ctx.title,
        categoryName,
        categoryDisplayName,
        colorText,
        paramsText,
        features,
        tags,
      });
    }
  }

  for (const offer of legacyOffers) {
    const legacy = offer.legacyProductId
      ? legacyById.get(offer.legacyProductId) || null
      : null;
    if (!legacy?.categoryId) continue;
    const category = categoryById.get(legacy.categoryId);
    if (!category) continue;

    const ctx = transformLegacyOfferToListingJoinContext(offer, legacy);
    if (!ctx || !ctx.listing.isActive) continue;

    const paramsText = collectParamsText(ctx.parameters);
    const colorText = ctx.colorParts.join(" ");
    const categoryName = category.name;
    const categoryDisplayName = getCategoryDisplayName(category);
    const tags = getSynonymTagsForText([
      ctx.title,
      categoryName,
      categoryDisplayName,
    ]);

    docs.push({
      ...ctx.listing,
      categoryId: category.id,
      rootCategory: category.rootCategory,
      docId: `${ctx.listing.id}-${ctx.listing.colorVariantName}`,
      title: ctx.title,
      categoryName,
      categoryDisplayName,
      colorText,
      paramsText,
      features: [],
      tags,
    });
  }

  return docs;
};
