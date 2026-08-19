import MiniSearch from "minisearch";
import { redis } from "@/upstash/redis";
import {
  ensureSearchStemmer,
  isSearchStemmerReady,
  processTerm,
} from "@/helpers/text";
import { buildFacetLexicon, buildSearchDocs } from "@/lib/search/buildDocs";
import { FacetLexicon, SearchDoc } from "@/lib/search/types";
import { SEARCH_FIELDS, SEARCH_STORE_FIELDS } from "./constants";

const REDIS_INDEX_KEY = "search:minisearch:v5";
const REDIS_DOCS_KEY = "search:docs:v5";
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24h — invalidate on product/offer writes

type CachedBundle = {
  index: MiniSearch<SearchDoc>;
  docsById: Map<string, SearchDoc>;
  lexicon: FacetLexicon;
  /** Whether the index was built with a working Polish stemmer. */
  stemmed: boolean;
};

let memoryCache: CachedBundle | null = null;

export const createEmptyMiniSearch = (): MiniSearch<SearchDoc> =>
  new MiniSearch<SearchDoc>({
    idField: "docId",
    fields: [...SEARCH_FIELDS],
    storeFields: [...SEARCH_STORE_FIELDS],
    processTerm: (term) => {
      const processed = processTerm(term);
      return processed || null;
    },
  });

const serializeLexicon = (lexicon: FacetLexicon) => ({
  colors: Object.fromEntries(lexicon.colors),
  fastenings: Object.fromEntries(lexicon.fastenings),
  materials: Object.fromEntries(lexicon.materials),
  categories: Object.fromEntries(lexicon.categories),
  features: Object.fromEntries(lexicon.features),
});

const deserializeLexicon = (raw: {
  colors: Record<string, string>;
  fastenings: Record<string, string>;
  materials: Record<string, string>;
  categories: Record<string, string>;
  features: Record<string, string>;
}): FacetLexicon => ({
  colors: new Map(Object.entries(raw.colors || {})),
  fastenings: new Map(Object.entries(raw.fastenings || {})),
  materials: new Map(Object.entries(raw.materials || {})),
  categories: new Map(Object.entries(raw.categories || {})),
  features: new Map(Object.entries(raw.features || {})),
});

const buildBundle = async (): Promise<CachedBundle> => {
  await ensureSearchStemmer();
  const docs = await buildSearchDocs();
  const index = createEmptyMiniSearch();
  if (docs.length > 0) {
    index.addAll(docs);
  } else {
    console.warn("buildSearchDocs returned 0 documents");
  }
  const docsById = new Map(docs.map((d) => [d.docId, d]));
  const lexicon = buildFacetLexicon(docs);
  return { index, docsById, lexicon, stemmed: isSearchStemmerReady() };
};

const persistBundle = async (bundle: CachedBundle): Promise<void> => {
  if (bundle.docsById.size === 0) return;

  try {
    const docs = Array.from(bundle.docsById.values());
    await Promise.all([
      redis.set(REDIS_INDEX_KEY, bundle.index.toJSON(), {
        ex: CACHE_TTL_SECONDS,
      }),
      redis.set(
        REDIS_DOCS_KEY,
        {
          docs,
          lexicon: serializeLexicon(bundle.lexicon),
          stemmed: bundle.stemmed,
        },
        { ex: CACHE_TTL_SECONDS },
      ),
    ]);
  } catch (error) {
    console.error("Failed to persist search index to Redis:", error);
  }
};

const loadBundleFromRedis = async (): Promise<CachedBundle | null> => {
  try {
    await ensureSearchStemmer();
    const [indexJson, docsPayload] = await Promise.all([
      redis.get(REDIS_INDEX_KEY),
      redis.get(REDIS_DOCS_KEY),
    ]);

    if (!indexJson || !docsPayload) return null;

    const parsedDocs =
      typeof docsPayload === "string" ? JSON.parse(docsPayload) : docsPayload;
    const indexData =
      typeof indexJson === "string" ? JSON.parse(indexJson) : indexJson;

    const docs = (parsedDocs.docs || []) as SearchDoc[];
    if (docs.length === 0) return null;

    const cachedStemmed = Boolean(parsedDocs.stemmed);
    // Stemmed index + normalize-only queries (or the reverse) → zero hits.
    if (cachedStemmed !== isSearchStemmerReady()) {
      console.warn(
        `Search Redis cache stemmer mismatch (cache=${cachedStemmed}, runtime=${isSearchStemmerReady()}); rebuilding`,
      );
      return null;
    }

    const lexicon = deserializeLexicon(parsedDocs.lexicon);
    const index = MiniSearch.loadJSON<SearchDoc>(JSON.stringify(indexData), {
      idField: "docId",
      fields: [...SEARCH_FIELDS],
      storeFields: [...SEARCH_STORE_FIELDS],
      processTerm: (term) => {
        const processed = processTerm(term);
        return processed || null;
      },
    });

    return {
      index,
      docsById: new Map(docs.map((d) => [d.docId, d])),
      lexicon,
      stemmed: cachedStemmed,
    };
  } catch (error) {
    console.error("Failed to load search index from Redis:", error);
    return null;
  }
};

export const getSearchBundle = async (): Promise<CachedBundle> => {
  await ensureSearchStemmer();

  if (
    memoryCache &&
    memoryCache.docsById.size > 0 &&
    memoryCache.stemmed === isSearchStemmerReady()
  ) {
    return memoryCache;
  }

  const fromRedis = await loadBundleFromRedis();
  if (fromRedis) {
    memoryCache = fromRedis;
    return fromRedis;
  }

  const bundle = await buildBundle();
  memoryCache = bundle;
  await persistBundle(bundle);
  return bundle;
};

export const invalidateSearchIndexCache = async (): Promise<void> => {
  memoryCache = null;
  try {
    await Promise.all([redis.del(REDIS_INDEX_KEY), redis.del(REDIS_DOCS_KEY)]);
  } catch (error) {
    console.error("Failed to invalidate search index cache:", error);
  }
};
