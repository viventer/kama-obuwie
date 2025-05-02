import { adminDB } from "@/firebase/firebaseAdmin";
import { DocumentReference } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { cache } from "react";

export function apiResponse(
  message: string,
  status: number,
  data?: Record<string, any>
): Response {
  if (status >= 200 && status < 400) {
    return NextResponse.json({ message, ...data }, { status });
  }
  return NextResponse.json({ message }, { status });
}

export type DocumentDataWithRef<T> = {
  data: T | null;
  ref: DocumentReference;
};

export const getDocumentFromAdminDB = cache(async function <T>(
  collection: string,
  id: string
): Promise<DocumentDataWithRef<T>> {
  const ref = adminDB.collection(collection).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return { data: null, ref };
  }
  return { data: doc.data() as T, ref };
});

export const getDocumentsFromAdminDB = cache(async function <T>(
  collection: string
): Promise<(T & { id: string })[] | null> {
  const ref = adminDB.collection(collection);
  const snapshot = await ref.get();
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T),
  }));
});
