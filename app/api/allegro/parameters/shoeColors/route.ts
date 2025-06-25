import {
  getAllegroCategories,
  SerializedAllegroCategory,
} from "@/server-actions/allegro/categories";
import { getProductParameters } from "@/server-actions/allegro/products";
import { apiResponse } from "@/server-actions/helpers";

export type AllegroColorWithShades = {
  color: string;
  shades: string[];
};

export type AllegroColorWithShadesResponse = {
  colors: string[];
  additionalColors: string[];
  colorsWithShades: AllegroColorWithShades[];
};

export async function GET() {
  const rootCategory: SerializedAllegroCategory[] = await getAllegroCategories(
    "obuwie męskie"
  );
  const categoryId = rootCategory[0].id;

  const productParameters = await getProductParameters(categoryId);

  if (!productParameters) {
    return apiResponse("Nie znaleziono parametrów.", 404);
  }

  const colorParameter = Object.values(productParameters).find(
    (param) => param.name === "Kolor"
  );
  const additionalColorParameter = Object.values(productParameters).find(
    (param) => param.name === "Kolor dodatkowy"
  );
  const shadeParameter = Object.values(productParameters).find(
    (param) => param.name === "Odcień"
  );

  if (
    !colorParameter?.dictionary ||
    !additionalColorParameter?.dictionary ||
    !shadeParameter?.dictionary
  ) {
    throw new Error("Nie znaleziono parametru koloru.");
  }

  const allegroColors = colorParameter.dictionary.map((opt) => opt.value);
  const allegroAdditionalColors = additionalColorParameter.dictionary.map(
    (opt) => opt.value
  );
  const allegroColorsWithShades: AllegroColorWithShades[] =
    colorParameter.dictionary.map((color) => {
      const shades = shadeParameter
        .dictionary!.filter((shade) =>
          shade.dependsOnValueIds.includes(color.id)
        )
        .map((shade) => shade.value);

      return {
        color: color.value,
        shades,
      };
    });

  return apiResponse("Pobrano parametry.", 200, {
    colors: allegroColors,
    additionalColors: allegroAdditionalColors,
    colorsWithShades: allegroColorsWithShades,
  });
}
