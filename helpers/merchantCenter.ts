import { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { MerchantCenterFootwearProduct } from "@/firebase/schemas/merchantCenterSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ColorVariant,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getOfferPriceForDTC, moneyValueToMicros } from "./prices";
import { toBase64UrlNoPadding } from "./encoding";
import { getRequiredEnv } from "./env";
import { buildProductPagePath } from "./productUrl";
import { google } from "googleapis";

const NO_BRAND_SENTINELS = new Set(["bez marki"]);
const MAX_ADDITIONAL_IMAGE_LINKS = 10;

export function normalizeMerchantCenterBrand(
  brand?: string,
): string | undefined {
  const trimmed = brand?.trim();
  if (!trimmed) return undefined;
  if (NO_BRAND_SENTINELS.has(trimmed.toLowerCase())) return undefined;
  return trimmed;
}

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
  return Number(availability[size].value) > 0 ? "in_stock" : "out_of_stock";
}

export function getMerchantCenterProductGender(
  rootCategory: CategoryWithId["rootCategory"],
): MerchantCenterFootwearProduct["productAttributes"]["gender"] | undefined {
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

export function getMerchantCenterFootwearProduct(
  payload: GetFootwearProductPayload,
): MerchantCenterFootwearProduct {
  const { offerData, productData, category, thumbnailUrl, size } = payload;

  if (!offerData.SKU) {
    throw new Error(
      `Brak SKU dla oferty o ID: ${offerData.id}. Nie można utworzyć produktu Merchant Center.`,
    );
  }

  const price = getOfferPriceForDTC(offerData.sellingPrices);
  if (!price) {
    throw new Error(
      `Brak ceny DTC dla oferty o ID: ${offerData.id} i SKU: ${offerData.SKU}`,
    );
  }

  const gender = getMerchantCenterProductGender(category.rootCategory);
  if (!gender) {
    throw new Error(
      `Nie można wyznaczyć gender dla rootCategory='${category.rootCategory}' (oferta ID: ${offerData.id}).`,
    );
  }

  const brand = normalizeMerchantCenterBrand(productData.brand);
  const manufacturerCode = productData.manufacturerCode?.trim() || "";
  const mpn = manufacturerCode || undefined;
  const hasIdentifiers = Boolean(brand && mpn);

  const additionalImageLinks = productData.imagesUrls
    .filter((url) => Boolean(url))
    .slice(0, MAX_ADDITIONAL_IMAGE_LINKS);

  const merchantProduct: MerchantCenterFootwearProduct = {
    offerId: `${offerData.SKU}r${size}`,
    contentLanguage: "pl",
    feedLabel: "PL",
    productAttributes: {
      title: `${offerData.title} ${size}`,
      link: `https://${
        process.env.NEXT_PUBLIC_NODE_ENV == "production"
          ? "kama-obuwie.pl"
          : "kama-obuwie-dev--kama-obuwie-ap.europe-west4.hosted.app"
      }${buildProductPagePath({
        id: productData.id,
        colorVariantName: offerData.colorVariantName,
        rootCategory: category.rootCategory,
        categoryName: category.name,
      })}`,
      imageLink: thumbnailUrl,
      ...(additionalImageLinks.length > 0 ? { additionalImageLinks } : {}),
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
      color: productData.colorVariant.color,
      gender,
      ageGroup: category.rootCategory === "obuwie dziecięce" ? "kids" : "adult",
      size,
      sizeSystem: "EU",
      sizeTypes: ["regular"],
      identifierExists: hasIdentifiers ? undefined : false,
    },
  };

  if (mpn) {
    merchantProduct.productAttributes.mpn = mpn;
    merchantProduct.productAttributes.itemGroupId =
      getMerchantCenterItemGroupId({
        brand,
        manufacturerCode: mpn,
      });
  }

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

export function getMerchantCenterProductInputResourceName({
  merchantId,
  contentLanguage,
  feedLabel,
  offerId,
}: {
  merchantId: string;
  contentLanguage: MerchantCenterFootwearProduct["contentLanguage"];
  feedLabel: MerchantCenterFootwearProduct["feedLabel"];
  offerId: MerchantCenterFootwearProduct["offerId"];
}): string {
  const rawId = `${contentLanguage}~${feedLabel}~${offerId}`;
  const encodedId = toBase64UrlNoPadding(rawId);
  return `accounts/${merchantId}/productInputs/${encodedId}`;
}

export function createGoogleMerchantServiceAccountAuth() {
  const clientEmail = getRequiredEnv("GOOGLE_MERCHANT_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_MERCHANT_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
}

export function getMerchantApiDataSourceName(merchantId: string): string {
  const dataSource = getRequiredEnv("GOOGLE_MERCHANT_DATASOURCE");
  if (dataSource.includes("/")) return dataSource;
  return `accounts/${merchantId}/dataSources/${dataSource}`;
}
