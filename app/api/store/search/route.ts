import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/server-actions/store/searchProducts";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { ROOT_CATEGORY_FROM_URL } from "@/helpers/listingFilters/types";
import {
  SEARCH_LISTING_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/search/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = (searchParams.get("q") || "").trim();
  if (query.length < SEARCH_MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [], query, expandedQuery: "" });
  }

  const plec = searchParams.get("plec");
  const rootCategory: RootCategory | undefined = plec
    ? ROOT_CATEGORY_FROM_URL[plec]
    : undefined;
  const limitRaw = Number(searchParams.get("limit") || "8");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), SEARCH_LISTING_LIMIT)
    : 8;
  const groupByRoot = searchParams.get("groupByRoot") === "1";

  try {
    const result = await searchProducts({
      query,
      rootCategory,
      limit,
      groupByRoot,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/store/search failed:", error);
    return NextResponse.json(
      { results: [], query, expandedQuery: "", error: "search_failed" },
      { status: 500 },
    );
  }
}
