/** Lowercase + strip Polish diacritics for search matching. */
export const normalizeForSearch = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[żŻ]/g, "z")
    .replace(/[źŹ]/g, "z");
};

type PolishStemFn = (word: string) => string;

let polishStem: PolishStemFn | null = null;
let stemmerReady = false;

/**
 * Turbopack either rewrites package imports (breaks WASM path) or rejects
 * dynamic file:// imports ("expression is too dynamic"). Force a native
 * Node ESM import that is invisible to the bundler.
 */
const importStemmerPackage = (): Promise<{ polish: PolishStemFn }> => {
  const nativeImport = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<{ polish: PolishStemFn }>;
  return nativeImport("multilingual-stemmer");
};

const getPolishStem = async (): Promise<PolishStemFn> => {
  if (polishStem) return polishStem;

  try {
    const mod = await importStemmerPackage();
    if (typeof mod.polish !== "function") {
      throw new Error("multilingual-stemmer.polish is not a function");
    }
    // Smoke-test WASM init (package top-level-awaits wasm.js).
    mod.polish("test");
    polishStem = mod.polish;
    stemmerReady = true;
    return polishStem;
  } catch (error) {
    console.error(
      "multilingual-stemmer failed to load; using normalize-only fallback",
      error,
    );
    polishStem = (word: string) => word;
    stemmerReady = false;
    return polishStem;
  }
};

export const processTerm = (term: string): string => {
  const normalized = normalizeForSearch(term);
  if (!normalized) return "";
  if (polishStem) {
    try {
      return polishStem(normalized) || normalized;
    } catch {
      return normalized;
    }
  }
  // Stemmer not loaded yet — normalize only.
  // ensureSearchStemmer() must be awaited before building/querying the index.
  return normalized;
};

export const isSearchStemmerReady = (): boolean => stemmerReady;

/** Call once before building or querying the search index. */
export const ensureSearchStemmer = async (): Promise<void> => {
  await getPolishStem();
};
