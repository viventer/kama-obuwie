import { normalizeForSearch } from "@/helpers/text";

/** Canonical Polish filter labels keyed by `normalizeForSearch` aliases. */
const COLOR_ENTRIES: ReadonlyArray<readonly [readonly string[], string]> = [
  [["gray", "grey", "szary", "szara", "szare"], "szary"],
  [["black", "czarny", "czarna", "czarne"], "czarny"],
  [["white", "bialy", "biala", "biale"], "biały"],
  [["pink", "rozowy", "rozowa", "rozowe", "rose", "fuchsia", "fuksja"], "różowy"],
  [["red", "czerwony", "czerwona", "czerwone"], "czerwony"],
  [["blue", "niebieski", "niebieska", "niebieskie"], "niebieski"],
  [
    ["navy", "navyblue", "granatowy", "granatowa", "granatowe", "granat"],
    "granatowy",
  ],
  [["green", "zielony", "zielona", "zielone"], "zielony"],
  [["brown", "brazowy", "brazowa", "brazowe", "braz", "tan"], "brązowy"],
  [["beige", "bezowy", "bezowa", "bezowe"], "beżowy"],
  [["yellow", "zolty", "zolta", "zolte"], "żółty"],
  [["purple", "violet", "fioletowy", "fioletowa", "fioletowe"], "fioletowy"],
  [["orange", "pomaranczowy", "pomaranczowa", "pomaranczowe"], "pomarańczowy"],
  [["gold", "golden", "zloty", "zlota", "zlote"], "złoty"],
  [["silver", "srebrny", "srebrna", "srebrne"], "srebrny"],
  [
    ["burgundy", "maroon", "bordowy", "bordowa", "bordowe", "burgundowy", "wine"],
    "bordowy",
  ],
  [["khaki"], "khaki"],
  [["cream", "kremowy", "kremowa", "kremowe"], "kremowy"],
  [["ecru"], "ecru"],
  [["ivory"], "kość słoniowa"],
  [["turquoise", "turkusowy", "turkusowa", "turkusowe", "turkus"], "turkusowy"],
  [["mint", "mietowy", "mietowa", "mietowe"], "miętowy"],
  [["coral", "koralowy", "koralowa", "koralowe"], "koralowy"],
  [["camel"], "camel"],
  [["nude"], "nude"],
  [["olive", "oliwkowy", "oliwkowa", "oliwkowe"], "oliwkowy"],
  [["teal"], "teal"],
  [["cyan"], "cyan"],
  [["magenta"], "magenta"],
  [
    [
      "charcoal",
      "graphite",
      "grafitowy",
      "grafitowa",
      "grafitowe",
      "antracyt",
      "antracytowy",
    ],
    "grafitowy",
  ],
  [["chocolate", "czekoladowy", "czekoladowa", "czekoladowe"], "czekoladowy"],
  [["rust", "rdzawy", "rdzawa", "rdzawe"], "rdzawy"],
  [["peach", "brzoskwiniowy", "brzoskwiniowa", "brzoskwiniowe"], "brzoskwiniowy"],
  [["salmon", "lososiowy", "lososiowa", "lososiowe"], "łososiowy"],
  [["mustard", "musztardowy", "musztardowa", "musztardowe"], "musztardowy"],
  [["lime", "limonkowy", "limonkowa", "limonkowe"], "limonkowy"],
  [["aqua"], "aqua"],
  [["lavender", "lawendowy", "lawendowa", "lawendowe"], "lawendowy"],
  [["lilac", "liliowy", "liliowa", "liliowe"], "liliowy"],
  [["indigo", "indygo"], "indygo"],
  [["copper", "miedziany", "miedziana", "miedziane"], "miedziany"],
  [["pearl", "perlowy", "perlowa", "perlowe"], "perłowy"],
  [["cognac", "koniakowy", "koniakowa", "koniakowe"], "koniakowy"],
  [["cherry", "wisniowy", "wisniowa", "wisniowe"], "wiśniowy"],
  [["emerald", "szmaragdowy", "szmaragdowa", "szmaragdowe"], "szmaragdowy"],
  [["azure", "lazurowy", "lazurowa", "lazurowe"], "lazurowy"],
  [["cobalt", "kobalt", "kobaltowy"], "kobaltowy"],
  [["natural", "naturalny", "naturalna", "naturalne"], "naturalny"],
  [
    [
      "multicolor",
      "multicolour",
      "multi",
      "wielokolorowy",
      "wielokolorowa",
      "wielokolorowe",
    ],
    "wielokolorowy",
  ],
];

const COLOR_DICTIONARY: Record<string, string> = Object.fromEntries(
  COLOR_ENTRIES.flatMap(([aliases, canonical]) =>
    aliases.map((alias) => [normalizeForSearch(alias), canonical] as const),
  ),
);

const MODIFIER_TOKENS = new Set(
  [
    "light",
    "dark",
    "jasny",
    "jasna",
    "jasne",
    "ciemny",
    "ciemna",
    "ciemne",
    "neon",
    "pastel",
    "metallic",
    "metaliczny",
    "metaliczna",
    "mat",
    "matowy",
    "matowa",
    "bright",
    "pale",
    "deep",
    "hot",
    "medium",
    "soft",
    "super",
    "extra",
  ].map(normalizeForSearch),
);

const LETTERS_ONLY = /[^\p{L}]+/gu;

const toDictionaryKey = (token: string): string =>
  normalizeForSearch(token.replace(LETTERS_ONLY, ""));

/**
 * Map a raw product color to a canonical Polish filter value.
 * Compound values keep the first recognized color token.
 * Unknown colors return `undefined` and should be omitted from filters.
 */
export const normalizeColorForFilter = (
  raw?: string,
): string | undefined => {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  const primaryPart = trimmed.split("/")[0]?.trim();
  if (!primaryPart) return undefined;

  const tokens = primaryPart.split(/[-_\s]+/).filter(Boolean);

  for (const token of tokens) {
    const key = toDictionaryKey(token);
    if (!key || MODIFIER_TOKENS.has(key)) continue;
    const canonical = COLOR_DICTIONARY[key];
    if (canonical) return canonical;
  }

  return undefined;
};
