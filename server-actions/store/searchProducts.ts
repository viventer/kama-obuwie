"use server";

import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { expandQueryWithSynonyms } from "@/lib/search/synonyms";
import { getSearchBundle } from "@/lib/search/indexCache";
import {
  extractSearchIntent,
  rerankSearchResults,
  type RankedSearchHit,
} from "@/lib/search/ranking";
import { isShoeRootCategory } from "@/lib/search/types";
import { z } from "zod";

const SearchProductsInputSchema = z.object({
  query: z.string().trim().min(1).max(200),
  rootCategory: z
    .enum(["obuwie męskie", "obuwie damskie", "obuwie dziecięce"])
    .optional(),
  limit: z.number().int().positive().max(500).optional(),
});

export type SearchProductsResult = {
  results: RankedSearchHit[];
  query: string;
  expandedQuery: string;
};

export const searchProducts = async function (input: {
  query: string;
  rootCategory?: RootCategory;
  limit?: number;
}): Promise<SearchProductsResult> {
  const parsed = SearchProductsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { results: [], query: input.query || "", expandedQuery: "" };
  }

  const { query, rootCategory, limit = 100 } = parsed.data;

  // Defensive: Next may pass still-encoded query strings in edge cases
  let decodedQuery = query;
  try {
    if (/%[0-9A-Fa-f]{2}/.test(query)) {
      decodedQuery = decodeURIComponent(query);
    }
  } catch {
    decodedQuery = query;
  }

  const expandedQuery = expandQueryWithSynonyms(decodedQuery);

  const { index, docsById, lexicon } = await getSearchBundle();
  const intent = extractSearchIntent(decodedQuery, lexicon);

  const rawHits = index.search(expandedQuery, {
    combineWith: "OR",
    // 0.25 bridges Polish stem mismatches like czolenk/czolenek (edit distance 1)
    fuzzy: 0.25,
    prefix: true,
    boost: {
      title: 3,
      categoryName: 3,
      categoryDisplayName: 2.5,
      tags: 2.5,
      brand: 2,
      colorText: 2,
      paramsText: 1.5,
      features: 1,
    },
  });

  // MiniSearch result.id is overwritten when "id" is also a storeField
  // (product id). Prefer stored docId; fall back to idField value.
  let ranked = rerankSearchResults(
    rawHits.map((h) => {
      const storedDocId =
        "docId" in h && h.docId != null ? String(h.docId) : undefined;
      return {
        docId: storedDocId ?? String(h.id),
        score: h.score,
      };
    }),
    docsById,
    intent,
  );

  if (rootCategory && isShoeRootCategory(rootCategory)) {
    ranked = ranked.filter((doc) => doc.rootCategory === rootCategory);
  }

  return {
    results: ranked.slice(0, limit),
    query: decodedQuery,
    expandedQuery,
  };
};
