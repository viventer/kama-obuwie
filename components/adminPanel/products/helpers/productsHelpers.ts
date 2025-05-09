import { ColorVariant } from "@/firebase/schemas/productsSchemas";

export const getColorVariantName = (colorVariant: ColorVariant) => {
  const primaryColor = colorVariant.shade || colorVariant.color;
  const additionalColor = colorVariant.additionalColor;
  return `${primaryColor}${additionalColor ? "-" + additionalColor : ""}`;
};
