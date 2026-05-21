import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import AddOfferToGMCButton from "@/components/adminPanel/offers/AddOfferToGMCButton";
import OffersInGMCDataTable from "@/components/adminPanel/offers/tables/OffersInGMCDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { notFound } from "next/navigation";

export default async function GoogleMerchantCenterPage() {
  const offers = await getDocumentsFromAdminDB<OfferWithId>("offers");

  if (!offers) {
    return notFound();
  }

  const offersAdded = offers.filter((offer) => offer.isAddedToMerchantCenter);
  const offersNotAdded = offers.filter(
    (offer) => !offer.isAddedToMerchantCenter,
  );

  return (
    <section>
      <SubpageHeading text="Google Merchant Center" />
      <h3 className="text-lg font-medium mb-2">
        Oferty dodane do Google Merchant Center
      </h3>
      <AddOfferToGMCButton offers={offersNotAdded} />
      <OffersInGMCDataTable data={offersAdded} />
    </section>
  );
}
