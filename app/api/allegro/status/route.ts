import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allegroTokens = await redis.hgetall("allegroAuthData");

    return NextResponse.json({
      AL1: Boolean(allegroTokens?.AL1AccessToken),
      AL2: Boolean(allegroTokens?.AL2AccessToken),
    });
  } catch (error) {
    console.error("Error checking Allegro status:", error);
    return NextResponse.json(
      { error: "Błąd podczas sprawdzania statusu Allegro" },
      { status: 500 }
    );
  }
}
