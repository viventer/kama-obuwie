import { normalizeForSearch } from "@/helpers/text";
import { FacetLexicon, SearchDoc, SearchIntent } from "@/lib/search/types";

const tokenize = (query: string): string[] =>
  query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Extract structured intent (color, fastening, material, category) from query tokens. */
export const extractSearchIntent = (
  query: string,
  lexicon: FacetLexicon,
): SearchIntent => {
  const tokens = tokenize(query);
  const intent: SearchIntent = {};
  const used = new Set<number>();

  // Prefer longer multi-word matches for category/material/fastening
  const tryMatchMap = (
    map: Map<string, string>,
    assign: (value: string) => void,
  ) => {
    for (let len = Math.min(3, tokens.length); len >= 1; len--) {
      for (let i = 0; i <= tokens.length - len; i++) {
        if ([...Array(len)].some((_, k) => used.has(i + k))) continue;
        const slice = tokens
          .slice(i, i + len)
          .map(normalizeForSearch)
          .join(" ");
        const match = map.get(slice);
        if (match) {
          assign(match);
          for (let k = 0; k < len; k++) used.add(i + k);
          return;
        }
      }
    }
  };

  tryMatchMap(lexicon.categories, (v) => {
    intent.category = v;
  });
  tryMatchMap(lexicon.fastenings, (v) => {
    intent.fastening = v;
  });
  tryMatchMap(lexicon.materials, (v) => {
    intent.material = v;
  });
  tryMatchMap(lexicon.colors, (v) => {
    intent.color = v;
  });

  return intent;
};

const normalizeEquals = (a: string | undefined, b: string | undefined) => {
  if (!a || !b) return false;
  return normalizeForSearch(a) === normalizeForSearch(b);
};

const arrayIncludesNormalized = (
  values: string[] | undefined,
  target: string | undefined,
): boolean => {
  if (!target || !values?.length) return false;
  const n = normalizeForSearch(target);
  return values.some((v) => normalizeForSearch(v) === n);
};

/** Bonus score for matching extracted intent facets. */
export const intentBonus = (doc: SearchDoc, intent: SearchIntent): number => {
  let bonus = 0;

  if (
    intent.category &&
    normalizeEquals(doc.categoryName, intent.category)
  ) {
    bonus += 2;
  }

  if (
    intent.color &&
    (normalizeEquals(doc.filters?.color, intent.color) ||
      normalizeForSearch(doc.colorText).includes(
        normalizeForSearch(intent.color),
      ))
  ) {
    bonus += 1.5;
  }

  if (
    intent.fastening &&
    arrayIncludesNormalized(doc.filters?.fastening, intent.fastening)
  ) {
    bonus += 1.5;
  }

  if (
    intent.material &&
    arrayIncludesNormalized(doc.filters?.externalMaterial, intent.material)
  ) {
    bonus += 1;
  }

  return bonus;
};

export type RankedSearchHit = SearchDoc & { score: number };

export const rerankSearchResults = (
  hits: Array<{ docId: string; score: number }>,
  docsById: Map<string, SearchDoc>,
  intent: SearchIntent,
): RankedSearchHit[] => {
  const ranked: RankedSearchHit[] = [];

  for (const hit of hits) {
    const doc = docsById.get(hit.docId);
    if (!doc) continue;
    ranked.push({
      ...doc,
      score: hit.score + intentBonus(doc, intent),
    });
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Prefer available products when scores tie
    const availA = Object.values(a.availability).some((q) => q > 0) ? 1 : 0;
    const availB = Object.values(b.availability).some((q) => q > 0) ? 1 : 0;
    return availB - availA;
  });

  return ranked;
};
