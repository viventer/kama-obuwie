import { revalidatePath } from "next/cache";

export function revalidateStorefrontListings() {
  revalidatePath("/", "page");
  revalidatePath("/listing", "page");
  revalidatePath("/listing/[categoryId]", "page");
}
