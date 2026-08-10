import { normalizeForSearch } from "@/helpers/text";
import synonymsRaw from "./synonyms.json";

/** Bidirectional synonym groups keyed by normalized canonical term. */
type SynonymMap = Record<string, string[]>;

const buildSynonymLookup = (): Map<string, Set<string>> => {
  const lookup = new Map<string, Set<string>>();

  for (const [canonical, variants] of Object.entries(
    synonymsRaw as SynonymMap,
  )) {
    const group = new Set<string>();
    const allTerms = [canonical, ...variants];
    for (const term of allTerms) {
      group.add(normalizeForSearch(term));
    }
    for (const term of group) {
      const existing = lookup.get(term) ?? new Set<string>();
      for (const g of group) existing.add(g);
      lookup.set(term, existing);
    }
  }

  return lookup;
};

const synonymLookup = buildSynonymLookup();

/** Expand a query string with synonym variants (space-joined unique terms). */
export const expandQueryWithSynonyms = (query: string): string => {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return query;

  const expanded = new Set<string>();
  for (const token of tokens) {
    expanded.add(token);
    const normalized = normalizeForSearch(token);
    const synonyms = synonymLookup.get(normalized);
    if (synonyms) {
      for (const s of synonyms) {
        expanded.add(s);
      }
    }
  }

  return Array.from(expanded).join(" ");
};

/**
 * Collect synonym tags for a document from its searchable text tokens.
 * Tags are normalized forms so they match after processTerm stemming.
 */
export const getSynonymTagsForText = (texts: string[]): string[] => {
  const tags = new Set<string>();

  for (const text of texts) {
    const tokens = text
      .trim()
      .split(/[\s,/|-]+/)
      .filter(Boolean);
    for (const token of tokens) {
      const normalized = normalizeForSearch(token);
      const synonyms = synonymLookup.get(normalized);
      if (synonyms) {
        for (const s of synonyms) {
          tags.add(s);
        }
      }
    }
  }

  return Array.from(tags);
};
