import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { getAllegroReturns } from "@/server-actions/allegro/returns";
import { notFound, redirect } from "next/navigation";
import ReturnsDataTable from "@/components/adminPanel/returns/tables/ReturnsDataTable";

export const revalidate = 0;

export default async function ReturnsPage() {
  let returnsResponse;

  try {
    returnsResponse = await getAllegroReturns();
  } catch (err) {
    console.error("Błąd podczas pobierania zwrotów z Allegro:", err);
    redirect("/admin-auth/allegro-connect");
  }

  if (!returnsResponse) {
    notFound();
  }

  const allReturns = [...returnsResponse.AL1, ...returnsResponse.AL2];

  return (
    <>
      <SubpageHeading text="Zwroty" />
      <ReturnsDataTable returns={allReturns} />
    </>
  );
}
