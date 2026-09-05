export const PRODUCT_ADS_QUERY_KEYS = {
  rootCategory: "rootCategory",
  categoryName: "categoryName",
} as const;

type ProductAdsParams = {
  rootCategory?: string;
  categoryName?: string;
};

export function applyProductAdsParams(
  params: URLSearchParams,
  ads: ProductAdsParams,
): boolean {
  let changed = false;

  if (
    ads.rootCategory &&
    params.get(PRODUCT_ADS_QUERY_KEYS.rootCategory) !== ads.rootCategory
  ) {
    params.set(PRODUCT_ADS_QUERY_KEYS.rootCategory, ads.rootCategory);
    changed = true;
  }

  if (
    ads.categoryName &&
    params.get(PRODUCT_ADS_QUERY_KEYS.categoryName) !== ads.categoryName
  ) {
    params.set(PRODUCT_ADS_QUERY_KEYS.categoryName, ads.categoryName);
    changed = true;
  }

  return changed;
}

export function buildProductPagePath({
  id,
  colorVariantName,
  rootCategory,
  categoryName,
}: {
  id: string;
  colorVariantName?: string;
  rootCategory?: string;
  categoryName?: string;
}): string {
  const params = new URLSearchParams();

  if (colorVariantName) {
    params.set("colorVariantName", colorVariantName);
  }

  applyProductAdsParams(params, { rootCategory, categoryName });

  const query = params.toString();
  return query ? `/product/${id}?${query}` : `/product/${id}`;
}
