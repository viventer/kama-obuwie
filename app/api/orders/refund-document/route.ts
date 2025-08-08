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
        const cenaJednostkowa = parseFloat(item.value);
        const wartoscBrutto = +(cenaJednostkowa * item.quantity).toFixed(2);
        const vat = +(wartoscBrutto * 0.23).toFixed(2);
        const netto = +(wartoscBrutto - vat).toFixed(2);
        totalBrutto += wartoscBrutto;
        totalVat += vat;
        totalNetto += netto;

        return `
        <tr>
          <td>${i + 1}</td>
          <td></td>
          <td>${item.quantity}</td>
          <td>${cenaJednostkowa.toFixed(2)} zł</td>
          <td>${wartoscBrutto.toFixed(2)} zł</td>
          <td>23%</td>
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
            margin: 20px;
            line-height: 1.3;
            color: #000;
            font-size: 10px;
          }
          .header {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          .location-date {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            font-size: 8px;
          }
          td {
            text-align: center;
          }
          td:nth-child(2) {
            text-align: left;
          }
          .summary {
            margin: 15px 0;
            font-size: 10px;
          }
          .summary div {
            margin: 3px 0;
          }
          .form-fields {
            margin-top: 15px;
            font-size: 10px;
          }
          .form-fields div {
            margin: 10px 0;
          }
          .underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 150px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
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
              <th>Cena jednostkowa brutto</th>
              <th>Wartość brutto</th>
              <th>Stawka VAT</th>
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
          <div>Przyczyna anulowania paragonu: zwrot allegro</div>
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
      format: "A5",
      landscape: true,
      margin: {
        top: "15px",
        bottom: "15px",
        left: "15px",
        right: "15px",
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
