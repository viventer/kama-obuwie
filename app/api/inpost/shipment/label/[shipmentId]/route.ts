import { adminStorage } from "@/firebase/firebaseAdmin";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { getInpostShipmentLabel } from "@/server-actions/inpost/shipment";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;

  let label: Buffer | null = null;
  try {
    label = await getInpostShipmentLabel(parseInt(shipmentId));
  } catch (err: any) {
    return apiErrorResponse("Nie udało się pobrać etykiety Inpost", 500, null, {
      step: "label_download",
      shipmentId,
    });
  }

  const bucket = adminStorage.bucket();
  const filename = `labels/${shipmentId}_${Date.now()}.pdf`;
  const file = bucket.file(filename);

  try {
    // Zapisz plik do Firebase Storage
    await file.save(label, {
      metadata: {
        contentType: "application/pdf",
        metadata: {
          shipmentId: shipmentId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Wygeneruj signed URL do pobrania
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24, // 24 godziny
    });

    const returnData = {
      downloadUrl: signedUrl,
      storagePath: filename,
      shipmentId: shipmentId,
    };

    // Zwróć informacje o pliku w JSON
    return apiResponse(
      "Etykieta została utworzona i zapisana pomyślnie.",
      200,
      returnData
    );
  } catch (err: any) {
    console.error("Błąd podczas zapisywania etykiety:", err);
    return apiErrorResponse("Nie udało się zapisać etykiety", 500, null, {
      step: "file_storage",
      filename: filename,
    });
  }
}
