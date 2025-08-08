import { NextRequest, NextResponse } from "next/server";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { getSignedUrl } from "@/server-actions/files/files";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: order } = await getDocumentFromAdminDB<Order>("orders", id);

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie znalezione" },
        { status: 404 }
      );
    }

    const labelFilePath = order.shipment?.labelFilePath;

    if (!labelFilePath) {
      return NextResponse.json(
        { error: "Etykieta przesyłki nie została jeszcze utworzona" },
        { status: 404 }
      );
    }

    const signedUrl = await getSignedUrl(labelFilePath);

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Nie udało się wygenerować linku do etykiety" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error getting shipping label URL:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania etykiety" },
      { status: 500 }
    );
  }
}
