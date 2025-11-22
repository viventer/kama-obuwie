import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.INPOST_GEOWIDGET;

    if (!token) {
      return NextResponse.json(
        { error: "InPost token not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error getting InPost token:", error);
    return NextResponse.json(
      { error: "Failed to get InPost token" },
      { status: 500 }
    );
  }
}
