import { NextResponse } from "next/server";
import archiver from "archiver";
import { adminStorage } from "@/firebase/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderPath = searchParams.get("folderPath");
  const downloadNameRaw = searchParams.get("downloadName");

  if (!folderPath) {
    return NextResponse.json(
      { error: "Brak folderPath w zapytaniu" },
      { status: 400 }
    );
  }

  const downloadName = downloadNameRaw?.match(/^[\w-]+$/)
    ? downloadNameRaw
    : "images";

  const bucket = adminStorage.bucket();
  const [files] = await bucket.getFiles({ prefix: folderPath });

  if (files.length === 0) {
    return NextResponse.json({ error: "Brak plików" }, { status: 404 });
  }

  // Tworzymy tymczasowy plik ZIP w Firebase Storage
  const tempZipPath = `temp-downloads/${downloadName}-${Date.now()}.zip`;
  const tempFile = bucket.file(tempZipPath);
  const writeStream = tempFile.createWriteStream({
    metadata: {
      contentType: "application/zip",
      metadata: {
        deleteAt: new Date(Date.now() + 3600000).toISOString(), // Usuń po 1h
      },
    },
  });

  const zipArchive = archiver("zip", {
    zlib: { level: 6 },
  });

  // Pipe archiwum do Firebase Storage
  zipArchive.pipe(writeStream);

  // Dodaj wszystkie pliki do archiwum
  for (const file of files) {
    const relativeName = file.name.replace(folderPath + "/", "");
    if (relativeName) {
      const fileStream = file.createReadStream();
      zipArchive.append(fileStream, { name: relativeName });
    }
  }

  await zipArchive.finalize();

  // Poczekaj na zakończenie uploadu
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  // Wygeneruj signed URL ważny przez 1 godzinę
  const [signedUrl] = await tempFile.getSignedUrl({
    action: "read",
    expires: Date.now() + 3600000, // 1 godzina
  });

  // Zwróć URL do pobrania
  return NextResponse.json({
    downloadUrl: signedUrl,
    filename: `${downloadName}.zip`,
    message: "Plik ZIP został wygenerowany. Link jest ważny przez 1 godzinę.",
  });
}
