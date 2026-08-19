/** Instant search / autocomplete starts only after this many characters. */
export const SEARCH_MIN_QUERY_LENGTH = 3;

/** Wait this long after the last keystroke before fetching instant results. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Hits shown in the overlay under the search input. */
export const SEARCH_INSTANT_DISPLAY_LIMIT = 6;

/** Max hits for the full `/listing?q=` results page. */
export const SEARCH_LISTING_LIMIT = 300;

export const SEARCH_FIELDS = [
  "title",
  "categoryName",
  "categoryDisplayName",
  "brand",
  "colorText",
  "paramsText",
  "features",
  "tags",
] as const;

export const SEARCH_STORE_FIELDS = [
  "docId",
  "title",
  "brand",
  "colorVariantName",
  "thumbnailUrl",
  "isThumbnailAiCoCreated",
  "price",
  "lowestPrice30d",
  "discountPercent",
  "isActive",
  "availability",
  "filters",
  "categoryId",
  "rootCategory",
  "categoryName",
  "categoryDisplayName",
  "colorText",
  "paramsText",
  "features",
  "tags",
] as const;
