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
  contentLanguage,
  feedLabel,
  offerId,
}: {
  contentLanguage: MerchantCenterFootwearProduct["contentLanguage"];
  feedLabel: MerchantCenterFootwearProduct["feedLabel"];
  offerId: MerchantCenterFootwearProduct["offerId"];
}): string {
  return `${contentLanguage}~${feedLabel}~${offerId}`;
}

export function getMerchantCenterItemGroupId({
  brand,
  manufacturerCode,
}: {
  brand?: string;
  manufacturerCode: string;
}): MerchantCenterFootwearProduct["productAttributes"]["itemGroupId"] {
  if (brand) {
    return `${brand}-${manufacturerCode}`;
  }
  return manufacturerCode;
}

export function getMerchantCenterProductAvaiability(
  availability: OfferWithId["availability"],
  size: string,
): MerchantCenterFootwearProduct["productAttributes"]["availability"] {
  return availability[size].value ? "in_stock" : "out_of_stock";
}

export function getMerchantCenterProductGender(
  rootCategory: CategoryWithId["rootCategory"],
): MerchantCenterFootwearProduct["productAttributes"]["gender"] {
  const genderMap: Record<
    string,
    MerchantCenterFootwearProduct["productAttributes"]["gender"]
  > = {
    "obuwie damskie": "female",
    "obuwie męskie": "male",
    "obuwie dziecięce": "unisex",
  };

  return genderMap[rootCategory];
}

export function getMerchantCenterProductMaterial(
  parameters: ProductWithId["parameters"] | LegacyProductWithId["parameters"],
): MerchantCenterFootwearProduct["productAttributes"]["material"] | null {
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

export type GetFootwearProductPayload = {
  offerData: Pick<
    OfferWithId,
    | "SKU"
    | "title"
    | "availability"
    | "sellingPrices"
    | "id"
    | "colorVariantName"
  >;
  productData: {
    id: string;
    brand?: string;
    manufacturerCode: string;
    imagesUrls: string[];
    description?: string;
    parameters: ProductWithId["parameters"] | LegacyProductWithId["parameters"];
    colorVariant: ColorVariant;
  };
  category: CategoryWithId;
  thumbnailUrl: string;
  size: string;
};

function moneyValueToMicros(value: string): string {
  const [wholePart, fractionalPart = "0"] = value.split(".");
  const normalizedFraction = (fractionalPart + "00").slice(0, 2);
  const whole = Number.parseInt(wholePart || "0", 10);
  const fraction = Number.parseInt(normalizedFraction || "0", 10);
  if (!Number.isFinite(whole) || !Number.isFinite(fraction)) {
    throw new Error(`Nieprawidłowa kwota: ${value}`);
  }
  return String(whole * 1_000_000 + fraction * 10_000);
}

export function getMerchantCenterFootwearProduct(
  payload: GetFootwearProductPayload,
): MerchantCenterFootwearProduct {
  const { offerData, productData, category, thumbnailUrl, size } = payload;

  const price = getOfferPriceForDTC(offerData.sellingPrices);
  if (!price) {
    throw new Error(
      `Brak ceny DTC dla oferty o ID: ${offerData.id} i SKU: ${offerData.SKU}`,
    );
  }

  const brand = productData.brand;
  const mpn = productData.manufacturerCode;

  const merchantProduct: MerchantCenterFootwearProduct = {
    offerId: `${offerData.SKU}r${size}`,
    contentLanguage: "pl",
    feedLabel: "PL",
    productAttributes: {
      title: offerData.title,
      link: `https://kama-obuwie.pl/product/${productData.id}?colorVariantName=${offerData.colorVariantName}`,
      imageLink: thumbnailUrl,
      additionalImageLinks: productData.imagesUrls,
      availability: getMerchantCenterProductAvaiability(
        offerData.availability,
        size,
      ),
      condition: "new",
      price: {
        amountMicros: moneyValueToMicros(price),
        currencyCode: "PLN",
      },
      googleProductCategory: "187",
      productTypes: [category.name],
      itemGroupId: getMerchantCenterItemGroupId({
        brand,
        manufacturerCode: productData.manufacturerCode,
      }),
      color: productData.colorVariant.color,
      gender: getMerchantCenterProductGender(category.rootCategory),
      ageGroup: category.rootCategory === "obuwie dziecięce" ? "kids" : "adult",
      size,
      sizeSystem: "EU",
      sizeTypes: ["regular"],
      mpn,
      identifierExists: brand ? undefined : false,
    },
  };

  if (productData.description) {
    merchantProduct.productAttributes.description = productData.description;
  }

  const material = getMerchantCenterProductMaterial(productData.parameters);
  if (material) {
    merchantProduct.productAttributes.material = material;
  }

  if (brand) {
    merchantProduct.productAttributes.brand = brand;
  }

  return merchantProduct;
}
