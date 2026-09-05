"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { getCurrentDateTimeInPoland } from "@/helpers/datetime";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { verifyUser } from "../auth/auth";

const MAX_CUSTOMERS = 5000;
const BATCH_SIZE = 1000;
const CSV_HEADER = "First Name,Last Name,Country,Zip,Email,Phone";

type OrderCustomerFields = Pick<Order, "buyer" | "delivery">;

type AllegroCustomerRow = {
  firstName: string;
  lastName: string;
  zip: string;
  email: string;
  phone: string;
};

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: AllegroCustomerRow[]): string {
  const lines = [
    CSV_HEADER,
    ...rows.map((row) =>
      [
        row.firstName,
        row.lastName,
        "PL",
        row.zip,
        row.email,
        row.phone,
      ]
        .map(escapeCsvField)
        .join(",")
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

function mapOrderToRow(
  data: OrderCustomerFields
): AllegroCustomerRow | null {
  const buyer = data.buyer;
  const email = buyer?.email?.trim();
  if (!buyer || !email) {
    return null;
  }

  const address = data.delivery?.address;
  const pickupAddress = data.delivery?.pickupPoint?.address;

  return {
    firstName: buyer.firstName ?? address?.firstName ?? "",
    lastName: buyer.lastName ?? address?.lastName ?? "",
    zip: address?.zipCode ?? pickupAddress?.zipCode ?? "",
    email,
    phone: buyer.phoneNumber ?? address?.phoneNumber ?? "",
  };
}

export async function generateAllegroCustomersCsv() {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const seenEmails = new Set<string>();
  const customers: AllegroCustomerRow[] = [];
  let lastDoc: QueryDocumentSnapshot | undefined;

  while (customers.length < MAX_CUSTOMERS) {
    let query = adminDB
      .collection("orders")
      .where("salesChannel", "==", "AL1")
      .orderBy("createdAt", "desc")
      .select("buyer", "delivery")
      .limit(BATCH_SIZE);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    for (const doc of snapshot.docs) {
      const row = mapOrderToRow(doc.data() as OrderCustomerFields);
      if (!row) {
        continue;
      }

      const emailKey = row.email.toLowerCase();
      if (seenEmails.has(emailKey)) {
        continue;
      }

      seenEmails.add(emailKey);
      customers.push(row);

      if (customers.length >= MAX_CUSTOMERS) {
        break;
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < BATCH_SIZE) {
      break;
    }
  }

  const date = getCurrentDateTimeInPoland().slice(0, 10);

  return {
    csv: toCsv(customers),
    filename: `allegro-klienci-${date}.csv`,
    count: customers.length,
  };
}
