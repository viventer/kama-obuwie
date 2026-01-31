import { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { MerchantCenterFootwearProduct } from "@/firebase/schemas/merchantCenterSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ColorVariant,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getOfferPriceForDTC } from "./prices";

export function getMerchantCenterProductId({
  channel,
  contentLanguage,
  targetCountry,
  offerId,
}: {
  channel: MerchantCenterFootwearProduct["channel"];
  contentLanguage: MerchantCenterFootwearProduct["contentLanguage"];
  targetCountry: MerchantCenterFootwearProduct["targetCountry"];
  offerId: MerchantCenterFootwearProduct["offerId"];
}): string {
  return `${channel}:${contentLanguage}:${targetCountry}:${offerId}`;
}

export function getMerchantCenterItemGroupId({
  brand,
  manufacturerCode,
}: {
  brand?: string;
  manufacturerCode: string;
}): MerchantCenterFootwearProduct["itemGroupId"] {
  if (brand) {
    return `${brand}-${manufacturerCode}`;
  }
  return manufacturerCode;
}

export function getMerchantCenterProductAvaiability(
  availability: OfferWithId["availability"],
  size: string,
): MerchantCenterFootwearProduct["availability"] {
  return availability[size].value ? "in stock" : "out of stock";
}

export function getMerchantCenterProductGender(
  rootCategory: CategoryWithId["rootCategory"],
): MerchantCenterFootwearProduct["gender"] {
  const genderMap: Record<string, MerchantCenterFootwearProduct["gender"]> = {
    "obuwie damskie": "female",
    "obuwie męskie": "male",
    "obuwie dziecięce": "unisex",
  };

  return genderMap[rootCategory];
}

export function getMerchantCenterProductMaterial(
  parameters: ProductWithId["parameters"] | LegacyProductWithId["parameters"],
): MerchantCenterFootwearProduct["material"] | null {
  if (!parameters) return null;

  const materialParam =
    parameters.required?.["materiał zewnętrzny"] ||
    parameters.required?.["materiał"] ||
    parameters.optional?.["materiał zewnętrzny"] ||
    parameters.optional?.["materiał"];

  if (materialParam) {
    return materialParam as string;
  }

  return null;
}

export function getMerchantCenterFootwearProduct(
  offerData: Pick<
    OfferWithId,
    | "SKU"
    | "title"
    | "availability"
    | "sellingPrices"
    | "id"
    | "colorVariantName"
  >,
  productData: {
    id: string;
    brand?: string;
    manufacturerCode: string;
    imagesUrls: string[];
    description?: string;
    parameters: ProductWithId["parameters"] | LegacyProductWithId["parameters"];
    colorVariant: ColorVariant;
  },
  category: CategoryWithId,
  thumbnailUrl: string,
  size: string,
): MerchantCenterFootwearProduct {
  const price = getOfferPriceForDTC(offerData.sellingPrices);
  if (!price) {
    throw new Error(
      `Brak ceny DTC dla oferty o ID: ${offerData.id} i SKU: ${offerData.SKU}`,
    );
  }

  const merchantProduct: MerchantCenterFootwearProduct = {
    offerId: `${offerData.SKU}r${size}`,
    title: offerData.title,
    link: `https://kama-obuwie.pl/product/${productData.id}?colorVariantName=${offerData.colorVariantName}`,
    imageLink: thumbnailUrl,
    additionalImageLinks: productData.imagesUrls,
    contentLanguage: "PL",
    targetCountry: "PL",
    channel: "online",
    availability: getMerchantCenterProductAvaiability(
      offerData.availability,
      size,
    ),
    condition: "new",
    price: {
      value: price,
      currency: "PLN",
    },
    googleProductCategory: "187",
    productTypes: [category.name],
    itemGroupId: getMerchantCenterItemGroupId({
      brand: productData?.brand,
      manufacturerCode: productData.manufacturerCode,
    }),
    color: productData.colorVariant.color,
    gender: getMerchantCenterProductGender(category.rootCategory),
    ageGroup: category.rootCategory === "obuwie dziecięce" ? "kids" : "adult",
    sizes: [size],
    sizeSystem: "EU",
    sizeType: "regular",
  };

  if (productData.description) {
    merchantProduct.description = productData.description;
  }

  const material = getMerchantCenterProductMaterial(productData.parameters);
  if (material) {
    merchantProduct.material = material;
  }

  const brand = productData.brand;
  if (brand) {
    merchantProduct.brand = brand;
  }

  return merchantProduct;
}
