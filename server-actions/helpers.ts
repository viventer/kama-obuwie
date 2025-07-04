import { DocumentReference } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export function apiResponse(
  message: string,
  status: number,
  data?: Record<string, any>
): Response {
  if (status === 204) {
    return new NextResponse(null, { status });
  }

  if (status >= 200 && status < 400) {
    return NextResponse.json({ ...data }, { status });
  }
  return NextResponse.json({ message }, { status });
}

export type DocumentDataWithRef<T> = {
  data: T | null;
  ref: DocumentReference;
};
