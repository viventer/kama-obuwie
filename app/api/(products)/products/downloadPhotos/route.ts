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

  const zipArchive = archiver("zip", { zlib: { level: 9 } });
  const headers = new Headers({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${downloadName}.zip"`,
  });

  const stream = new ReadableStream({
    start(controller) {
      zipArchive.on("data", (chunk) => controller.enqueue(chunk));
      zipArchive.on("end", () => controller.close());
      zipArchive.on("error", (err) => controller.error(err));

      files.forEach((file) => {
        const relativeName = file.name.replace(folderPath + "/", "");
        zipArchive.append(file.createReadStream(), { name: relativeName });
      });

      zipArchive.finalize();
    },
  });

  return new NextResponse(stream, { headers });
}
