import { adminDB } from "@/firebase/firebaseAdmin";
import { clsx, type ClassValue } from "clsx";
import { DocumentData, DocumentReference } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function response(
  message: string,
  status: number,
  data?: Record<string, any>
): Response {
  if (status >= 200 && status < 400) {
    return NextResponse.json({ message, data }, { status });
  }
  return new Response(JSON.stringify({ error: message }), { status });
}

export type DocumentDataWithRef = {
  data: DocumentData | null;
  ref: DocumentReference;
};

export async function getDocumentFromAdminDB(
  collection: string,
  id: string
): Promise<DocumentDataWithRef> {
  const ref = adminDB.collection(collection).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return { data: null, ref };
  }
  const data = doc.data() as DocumentData;
  return { data, ref };
}

export async function getDocumentsFromAdminDB(
  collection: string
): Promise<DocumentData[] | null> {
  const ref = adminDB.collection(collection);
  const snapshot = await ref.get();
  if (snapshot.empty) {
    return null;
  }
  const data = snapshot.docs.map((doc) => doc.data() as DocumentData);
  return data;
}
