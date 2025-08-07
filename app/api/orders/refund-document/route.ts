import { adminStorage } from "@/firebase/firebaseAdmin";
import { RefundDocumentSchema } from "@/firebase/schemas/ordersSchemas";
import { formatDate } from "@/lib/utils";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";
import puppeteer, { Browser } from "puppeteer";

// Wymuszamy Node.js runtime
export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  let browser: Browser | null = null;

  try {
    const body = await req.json();
    const parsed = RefundDocumentSchema.parse(body);
    const { items } = parsed;

    // Obliczenie sum
    let totalBrutto = 0,
      totalVat = 0,
      totalNetto = 0;

    const tableRows = items
      .map((item, i) => {
        const brutto = parseFloat(item.value);
        const vat = +(brutto * 0.23).toFixed(2);
        const netto = +(brutto - vat).toFixed(2);
        totalBrutto += brutto;
        totalVat += vat;
        totalNetto += netto;

        return `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${brutto.toFixed(2)} zł</td>
          <td>${vat.toFixed(2)} zł</td>
          <td>${netto.toFixed(2)} zł</td>
        </tr>
      `;
      })
      .join("");

    // HTML template dla dokumentu
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Protokół anulowania sprzedaży</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 50px;
            line-height: 1.4;
            color: #000;
          }
          .header {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
          }
          .location-date {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          td {
            text-align: center;
          }
          td:nth-child(2) {
            text-align: left;
          }
          .summary {
            margin: 20px 0;
          }
          .summary div {
            margin: 5px 0;
          }
          .form-fields {
            margin-top: 20px;
          }
          .form-fields div {
            margin: 15px 0;
          }
          .underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 300px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Protokół anulowania sprzedaży z kasy fiskalnej
        </div>
        
        <div class="location-date">
          <div>Miejscowość: Bochnia</div>
          <div>Data: ${formatDate(new Date().toISOString())}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Lp.</th>
              <th>Nazwa towaru</th>
              <th>Ilość</th>
              <th>Cena brutto</th>
              <th>Kwota VAT</th>
              <th>Wartość netto</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="summary">
          <div><strong>Łączna wartość protokołu: ${totalBrutto.toFixed(
            2
          )} zł</strong></div>
          <div>Zmniejszenie sprzedaży brutto: ${totalBrutto.toFixed(2)} zł</div>
          <div>Zmniejszenie kwoty podatku PTU: ${totalVat.toFixed(2)} zł</div>
          <div>Zmniejszenie sprzedaży netto: ${totalNetto.toFixed(2)} zł</div>
        </div>
        
        <div class="form-fields">
          <div>Załączono paragon nr: <span class="underline">&nbsp;</span></div>
          <div>Przyczyna anulowania paragonu: <span class="signature-line">&nbsp;</span></div>
          <div style="margin-top: 30px;">
            Imię i nazwisko oraz podpis osoby sporządzającej protokół: <span class="signature-line">&nbsp;</span>
          </div>
        </div>
      </body>
      </html>
    `;

    // Uruchomienie puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generowanie PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "50px",
        bottom: "50px",
        left: "50px",
        right: "50px",
      },
      printBackground: true,
    });

    // Zamknięcie przeglądarki
    await browser.close();

    // Zapis do Firebase Storage
    const bucket = adminStorage.bucket();
    const filename = `refund-documents/${Math.random()
      .toString(36)
      .slice(2)}_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    await file.save(pdfBuffer, {
      metadata: { contentType: "application/pdf" },
    });
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 86400_000,
    });

    return apiResponse("Dokument został wygenerowany i zapisany", 200, {
      url: signedUrl,
      filePath: filename,
    });
  } catch (error: any) {
    // Upewnij się, że przeglądarka zostanie zamknięta w przypadku błędu
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Błąd podczas zamykania przeglądarki:", closeError);
      }
    }

    console.error("Błąd podczas generowania dokumentu zwrotu wpłaty:", error);
    return apiErrorResponse(
      "Nie udało się wygenerować dokumentu zwrotu wpłaty",
      500,
      null,
      { step: "document_generation", originalMessage: error.message }
    );
  }
};
