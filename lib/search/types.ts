import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";

export type SearchDoc = ProductListingData & {
  docId: string;
  title: string;
  categoryName: string;
  categoryDisplayName: string;
  colorText: string;
  paramsText: string[];
  features: string[];
  tags: string[];
};

export type SearchIntent = {
  color?: string;
  fastening?: string;
  material?: string;
  category?: string;
};

export type FacetLexicon = {
  colors: Map<string, string>;
  fastenings: Map<string, string>;
  materials: Map<string, string>;
  categories: Map<string, string>;
  features: Map<string, string>;
};

export const SHOE_ROOT_CATEGORIES: RootCategory[] = [
  "obuwie męskie",
  "obuwie damskie",
  "obuwie dziecięce",
];

export const isShoeRootCategory = (
  root: string | undefined,
): root is RootCategory =>
  !!root &&
  (SHOE_ROOT_CATEGORIES as string[]).includes(root);
