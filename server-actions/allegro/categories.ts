"use server";

import {
  AllegroHeaders,
  getSingleAllegroHeaders,
} from "@/server-actions/allegro/global";
import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type SerializedAllegroCategory = {
  id: string;
  name: string;
  parentId: string | null;
  leaf: boolean;
  children?: SerializedAllegroCategory[];
};

export type AllegroLeafCategory = {
  id: string;
  name: string;
};

export type AllegroCategory = {
  id: string;
  leaf: boolean;
  name: string;
  parent: { id: string };
};

const serializeCategories = (
  categories: AllegroCategory[]
): SerializedAllegroCategory[] =>
  categories.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parent?.id || null,
    leaf: c.leaf,
  }));

async function getAllegroChildrenCategories(
  parentCategoryId: string,
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> {
  const resp = await axios.get(url, {
    headers: allegroHeaders,
    params: { "parent.id": parentCategoryId },
  });
  return serializeCategories(resp.data.categories as AllegroCategory[]);
}

function extractLeafCategories(
  categories: SerializedAllegroCategory[],
  parentName: string = ""
): AllegroLeafCategory[] {
  const leaves: AllegroLeafCategory[] = [];
  categories.forEach((cat) => {
    const fullName = parentName ? `${parentName} ${cat.name}` : cat.name;
    if (cat.leaf) {
      leaves.push({ id: cat.id, name: fullName });
    } else if (cat.children) {
      leaves.push(...extractLeafCategories(cat.children, cat.name));
    }
  });
  return leaves;
}

async function enrichWithChildren(
  categories: SerializedAllegroCategory[],
  allegroHeaders: AllegroHeaders,
  url: string,
  depth = 1
): Promise<SerializedAllegroCategory[]> {
  if (depth < 1) return categories;

  return await Promise.all(
    categories.map(async (cat) => {
      if (cat.leaf) return cat;
      const children = await getAllegroChildrenCategories(
        cat.id,
        allegroHeaders,
        url
      );
      cat.children = children;
      if (depth > 1) {
        cat.children = await enrichWithChildren(
          children,
          allegroHeaders,
          url,
          depth - 1
        );
      }
      return cat;
    })
  );
}

async function getAdultCategories(
  rootCategories: SerializedAllegroCategory[],
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> {
  const moda = rootCategories.find((c) => c.name === "Moda");
  if (!moda) return [];

  const modaChildren = await getAllegroChildrenCategories(
    moda.id,
    allegroHeaders,
    url
  );
  const ood = modaChildren.find((c) => c.name === "Odzież, Obuwie, Dodatki");
  if (!ood) return [];

  const oodChildren = await getAllegroChildrenCategories(
    ood.id,
    allegroHeaders,
    url
  );
  const footwear = oodChildren.find((c) => c.name === "Obuwie");
  if (!footwear) return [];

  return getAllegroChildrenCategories(footwear.id, allegroHeaders, url);
}

async function getKidsCategories(
  rootCategories: SerializedAllegroCategory[],
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> {
  const kids = rootCategories.find((c) => c.name === "Dziecko");
  if (!kids) return [];

  const kidsChildren = await getAllegroChildrenCategories(
    kids.id,
    allegroHeaders,
    url
  );
  const footwear = kidsChildren.find((c) => c.name === "Obuwie");
  if (!footwear) return [];

  return getAllegroChildrenCategories(footwear.id, allegroHeaders, url);
}

export async function getAllegroCategoryById(
  categoryId: string
): Promise<string> {
  const accessToken = await getAllegroUserAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/categories/${categoryId}`;
  const allegroHeaders = getSingleAllegroHeaders(accessToken);
  const resp = await axios.get(url, { headers: allegroHeaders });
  return resp.data.name;
}

export async function getAllegroCategories(
  rootCategory: RootCategory
): Promise<AllegroLeafCategory[]> {
  const accessToken = await getAllegroUserAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/categories`;
  const allegroHeaders = getSingleAllegroHeaders(accessToken);

  const resp = await axios.get(url, { headers: allegroHeaders });
  const allCats = serializeCategories(
    resp.data.categories as AllegroCategory[]
  );

  let base: SerializedAllegroCategory[] = [];
  if (
    rootCategory === "obuwie dziecięce" ||
    rootCategory === "akcesoria dziecięce"
  ) {
    const kidsCats = await getKidsCategories(allCats, allegroHeaders, url);
    if (rootCategory === "akcesoria dziecięce") {
      const acc = kidsCats.find((c) => c.name === "Dodatki do obuwia");
      base = acc
        ? await getAllegroChildrenCategories(acc.id, allegroHeaders, url)
        : [];
    } else {
      base = kidsCats.filter((c) => c.name !== "Dodatki do obuwia");
    }
  } else {
    const adultCats = await getAdultCategories(allCats, allegroHeaders, url);
    const male = adultCats.find((c) => c.name === "Męskie");
    const female = adultCats.find((c) => c.name === "Damskie");
    const accessories = adultCats.find((c) => c.name === "Akcesoria");

    switch (rootCategory) {
      case "obuwie męskie":
        base = male
          ? await getAllegroChildrenCategories(male.id, allegroHeaders, url)
          : [];
        break;
      case "obuwie damskie":
        base = female
          ? await getAllegroChildrenCategories(female.id, allegroHeaders, url)
          : [];
        break;
      case "akcesoria":
        base = accessories
          ? await getAllegroChildrenCategories(
              accessories.id,
              allegroHeaders,
              url
            )
          : [];
        break;
      default:
        base = [];
    }
  }

  const enriched = await enrichWithChildren(base, allegroHeaders, url, 1);

  return extractLeafCategories(enriched);
}
