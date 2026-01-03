import { convertToAllegroDescription } from "@/helpers/allegroOffers";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";
import {
  Description,
  DescriptionVariable,
} from "@/firebase/schemas/productsSchemas";

export type ConvertDescriptionBody = {
  description: Description;
  imagesUrls: string[];
  variableValues: Record<DescriptionVariable, string>;
};

export async function POST(request: NextRequest) {
  try {
    const { description, imagesUrls, variableValues }: ConvertDescriptionBody =
      await request.json();

    const allegroDescription = await convertToAllegroDescription(
      description,
      imagesUrls,
      variableValues
    );

    return apiResponse(
      "Opis został skonwertowany do formatu Allegro.",
      200,
      allegroDescription
    );
  } catch (error) {
    return apiResponse(`Błąd podczas konwersji opisu: ${error}`, 500);
  }
}
