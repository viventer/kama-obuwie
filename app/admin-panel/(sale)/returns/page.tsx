import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { getAllegroReturns } from "@/server-actions/allegro/returns";
import { notFound } from "next/navigation";
import ReturnsDataTable from "@/components/adminPanel/returns/tables/ReturnsDataTable";

export const revalidate = 180;

export default async function ReturnsPage() {
  const returnsResponse = await getAllegroReturns();

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
