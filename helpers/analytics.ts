import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import {
  UserDataAddressType,
  UserDataType,
} from "@/firebase/schemas/analyticsSchemas";

function nonEmpty(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toE164PlPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("48") && digits.length >= 11) {
    return `+${digits}`;
  }

  return `+48${digits}`;
}

function formatStreet(
  address: NonNullable<CheckoutData["address"]>
): string | undefined {
  const street = nonEmpty(address.street);
  const buildingNumber = nonEmpty(address.buildingNumber);
  if (!street || !buildingNumber) return undefined;

  const apartmentNumber = nonEmpty(address.apartmentNumber);
  return apartmentNumber
    ? `${street} ${buildingNumber}/${apartmentNumber}`
    : `${street} ${buildingNumber}`;
}

export function buildPurchaseUserData(
  checkoutData: CheckoutData
): UserDataType {
  const buyerAddress = checkoutData.address;
  const pickupAddress = checkoutData.pickupPoint?.address;
  const usesPickupAddress = !buyerAddress && !!pickupAddress;

  const city = usesPickupAddress
    ? nonEmpty(pickupAddress.city)
    : nonEmpty(buyerAddress?.city);
  const postalCode = usesPickupAddress
    ? nonEmpty(pickupAddress.zipCode)
    : nonEmpty(buyerAddress?.postalCode);

  const address: UserDataAddressType = {
    first_name: checkoutData.firstName.trim(),
    last_name: checkoutData.lastName.trim(),
    country: "PL",
  };

  if (!usesPickupAddress) {
    const street = buyerAddress ? formatStreet(buyerAddress) : undefined;
    if (street) address.street = street;
  }

  if (city) address.city = city;
  if (postalCode) address.postal_code = postalCode;

  return {
    email: checkoutData.email.trim(),
    phone_number: toE164PlPhoneNumber(checkoutData.phoneNumber),
    address,
  };
}

export function setGtagUserData(userData: UserDataType): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("set", "user_data", userData);
}
