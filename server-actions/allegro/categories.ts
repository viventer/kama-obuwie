"use server";

import {
  AllegroHeaders,
  getAllegroHeaders,
} from "@/server-actions/allegro/global";
import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type SerializedAllegroCategory = {
  id: string;
  name: string;
  parentId: string | null;
};

export type AllegroCategory = {
  id: string;
  leaf: boolean;
  name: string;
  parent: {
    id: string;
  };
};

const serializeCategories = (
  categories: AllegroCategory[]
): SerializedAllegroCategory[] => {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category?.parent?.id || null,
  }));
};

const findCategoryByName = (
  categories: SerializedAllegroCategory[],
  name: string
): SerializedAllegroCategory | null => {
  return categories.find((category) => category.name === name) || null;
};

const getAdultCategories = async (
  rootCategories: SerializedAllegroCategory[],
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> => {
  const moda = findCategoryByName(
    rootCategories,
    "Moda"
  ) as SerializedAllegroCategory;

  const modaChildren = await getAllegroChildrenCategories(
    moda.id,
    allegroHeaders,
    url
  );

  const clothesFootwearAccessories = findCategoryByName(
    modaChildren,
    "Odzież, Obuwie, Dodatki"
  ) as SerializedAllegroCategory;

  const clothesFootwearAccessoriesChildren = await getAllegroChildrenCategories(
    clothesFootwearAccessories.id,
    allegroHeaders,
    url
  );

  const footwear = findCategoryByName(
    clothesFootwearAccessoriesChildren,
    "Obuwie"
  ) as SerializedAllegroCategory;
  const footwearChildren = await getAllegroChildrenCategories(
    footwear.id,
    allegroHeaders,
    url
  );

  return footwearChildren;
};

const getKidsCategories = async (
  rootCategories: SerializedAllegroCategory[],
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> => {
  const kids = findCategoryByName(
    rootCategories,
    "Dziecko"
  ) as SerializedAllegroCategory;
  const kidsChildren = await getAllegroChildrenCategories(
    kids.id,
    allegroHeaders,
    url
  );

  const footwear = findCategoryByName(
    kidsChildren,
    "Obuwie"
  ) as SerializedAllegroCategory;
  const footwearChildren = await getAllegroChildrenCategories(
    footwear.id,
    allegroHeaders,
    url
  );

  return footwearChildren;
};

export async function getAllegroCategoryById(
  categoryId: string
): Promise<string> {
  const accessToken = await getAllegroUserAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/categories/${categoryId}`;
  const allegroHeaders = getAllegroHeaders(accessToken);
  const resp = await axios.get(url, {
    headers: allegroHeaders,
  });

  return resp.data.name;
}

export async function getAllegroCategories(
  rootCategory: RootCategory
): Promise<SerializedAllegroCategory[]> {
  const accessToken = await getAllegroUserAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/categories`;
  const allegroHeaders = getAllegroHeaders(accessToken);
  const resp = await axios.get(url, {
    headers: allegroHeaders,
  });

  const data = resp.data.categories as AllegroCategory[];
  const allegroCategories = serializeCategories(data);

  if (
    rootCategory === "obuwie dziecięce" ||
    rootCategory === "akcesoria dziecięce"
  ) {
    const kidsCategories = await getKidsCategories(
      allegroCategories,
      allegroHeaders,
      url
    );
    const withoutAccessories = kidsCategories.filter(
      (category) => category.name !== "Dodatki do obuwia"
    );
    const accessories = findCategoryByName(
      kidsCategories,
      "Dodatki do obuwia"
    ) as SerializedAllegroCategory;
    const accessoriesCategoriesChildren = await getAllegroChildrenCategories(
      accessories.id,
      allegroHeaders,
      url
    );

    return rootCategory === "akcesoria dziecięce"
      ? accessoriesCategoriesChildren
      : withoutAccessories;
  } else {
    const adultCategories = await getAdultCategories(
      allegroCategories,
      allegroHeaders,
      url
    );
    const male = findCategoryByName(
      adultCategories,
      "Męskie"
    ) as SerializedAllegroCategory;
    const maleCategoriesChildren = await getAllegroChildrenCategories(
      male.id,
      allegroHeaders,
      url
    );

    const female = findCategoryByName(
      adultCategories,
      "Damskie"
    ) as SerializedAllegroCategory;
    const femaleCategoriesChildren = await getAllegroChildrenCategories(
      female.id,
      allegroHeaders,
      url
    );

    const accessories = findCategoryByName(
      adultCategories,
      "Akcesoria"
    ) as SerializedAllegroCategory;
    const accessoriesCategoriesChildren = await getAllegroChildrenCategories(
      accessories.id,
      allegroHeaders,
      url
    );

    const category =
      rootCategory === "obuwie męskie"
        ? maleCategoriesChildren
        : rootCategory === "obuwie damskie"
        ? femaleCategoriesChildren
        : accessoriesCategoriesChildren;

    return category;
  }
}

export async function getAllegroChildrenCategories(
  parentCategoryId: string,
  allegroHeaders: AllegroHeaders,
  url: string
): Promise<SerializedAllegroCategory[]> {
  const resp = await axios.get(url, {
    headers: allegroHeaders,
    params: {
      "parent.id": parentCategoryId,
    },
  });

  const data = resp.data.categories as AllegroCategory[];
  const allegroCategories = serializeCategories(data);

  return allegroCategories;
}
