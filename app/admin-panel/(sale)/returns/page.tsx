import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { getAllegroReturns } from "@/server-actions/allegro/returns";
import { notFound } from "next/navigation";

export const revalidate = 180;

export default async function ReturnsPage() {
  const returnsResponse = await getAllegroReturns();

  if (!returnsResponse) {
    notFound();
  }

  return (
    <>
      <SubpageHeading text="Zwroty" />
    </>
  );
}
