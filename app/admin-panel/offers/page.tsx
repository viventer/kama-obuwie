import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OffersDataTable from "@/components/adminPanel/offers/tables/OffersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export const revalidate = 0;

export default async function ProductsPage() {
  const offers = await getDocumentsFromAdminDB<OfferWithId>("offers");

  return (
    <>
      <SubpageHeading text="Oferty" />
      <OffersDataTable data={offers || null} />
    </>
  );
}
