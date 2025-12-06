import { adminStorage } from "@/firebase/firebaseAdmin";
import { ReturnFormData } from "@/firebase/schemas/returnsSchemas";
import { reasonTranslations } from "@/lib/constants";
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
    const parsed: ReturnFormData = body;

    const buyerName = parsed.buyerData.name || parsed.buyerData.companyName;
    if (!buyerName) {
      return apiErrorResponse(
        "Brak imienia i nazwiska lub nazwy firmy kupującego",
        400
      );
    }

    const itemsRows = parsed.items
      .map((item, i) => {
        return `
        <tr>
          <td>${item.name}</td>
          <td>${
            item?.reason?.type
              ? reasonTranslations[item.reason.type]
              : "Nie podano"
          }</td>
          <td>${item.quantity}</td>
          <td>${item.price.amount} PLN</td>
        </tr>
      `;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oświadczenie o odstąpieniu od umowy</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 30px;
            line-height: 1.4;
            color: #000;
            font-size: 11px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ff6600;
          }
          .date {
            text-align: right;
            font-size: 10px;
          }
          .seller-info {
            margin-bottom: 20px;
            font-size: 10px;
          }
          .title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
          }
          .content {
            margin: 15px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }
          .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          .summary {
            margin: 15px 0;
            font-size: 11px;
          }
          .buyer-info {
            margin: 20px 0;
          }
          .signature-section {
            margin-top: 40px;
            font-size: 10px;
          }
          .note {
            margin-top: 20px;
            font-size: 9px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="seller-info">
              <strong>Dane sprzedawcy</strong><br>
              <strong>nazwa firmy:</strong><br>
              ${parsed.sellerData.companyName}<br>
              <strong>NIP:</strong><br>
              ${parsed.sellerData.nip}<br>
              <strong>adres:</strong><br>
              ${parsed.sellerData.street}<br>
              ${parsed.sellerData.city} ${parsed.sellerData.zipCode}<br>
              ${parsed.sellerData.country}
            </div>
          </div>
          <div>
            <div class="logo">allegro</div>
            <div class="date">Data: ${formatDate(
              new Date().toISOString()
            )}</div>
          </div>
        </div>

        <div class="title">
          Oświadczenie o odstąpieniu od umowy zawartej na odległość
        </div>

        <div class="content">
          Oświadczam, że zgodnie z obowiązującymi przepisami prawa odstępuję od umowy sprzedaży następujących towarów:
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Przedmiot (numer oferty)</th>
              <th>Powód odstąpienia</th>
              <th>Sztuk</th>
              <th>Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <strong>Razem</strong>
          <span style="float: right;">${parseFloat(parsed.totalValue).toFixed(
            2
          )} PLN</span>
        </div>

        <div class="buyer-info">
          <strong>Dane kupującego:</strong><br>
          ${buyerName}<br>
          Client: ${parsed.buyerData.allegroLogin}<br>
          ${parsed.buyerData.street}<br>
          ${parsed.buyerData.city} ${parsed.buyerData.zipCode}<br>
          ${parsed.buyerData.country}
        </div>

        <div class="summary">
          <strong>data zakupu:</strong> ${formatDate(parsed.orderDate)}<br>
        </div>

        <div class="note">
          Zwrot pieniędzy nastąpi na rachunek wykorzystany przy płatności za zamówienie.
        </div>

      </body>
      </html>
    `;

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

    const pdfBuffer = await page.pdf({
      format: "A5",
      landscape: false,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
      printBackground: true,
    });

    await browser.close();

    const bucket = adminStorage.bucket();
    const filename = `return-forms/${Math.random()
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

    return apiResponse("Formularz zwrotu został wygenerowany i zapisany", 200, {
      url: signedUrl,
      filePath: filename,
    });
  } catch (error: any) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Błąd podczas zamykania przeglądarki:", closeError);
      }
    }

    console.error("Błąd podczas generowania formularza zwrotu:", error);
    return apiErrorResponse(
      "Nie udało się wygenerować formularza zwrotu",
      500,
      null,
      { step: "form_generation", originalMessage: error.message }
    );
  }
};
