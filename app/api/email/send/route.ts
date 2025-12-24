import {
  sendOrderEmail,
  SendOrderEmailPayload,
} from "@/server-actions/emails/orderEmails";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const payload: SendOrderEmailPayload = await request.json();
  try {
    const response = await sendOrderEmail(payload);
    return apiResponse("Email został wysłany.", 200, { response });
  } catch (err) {
    return apiErrorResponse("Błąd podczas wysyłania emaila.", 500);
  }
}
