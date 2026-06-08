import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OfferProductInfo from "@/components/adminPanel/offers/OfferProductInfo";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import Image from "next/image";
import ConnectOffer from "@/components/adminPanel/offers/ConnectOffer";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: "Edytuj warianty",
  };
}

export default async function Multivariants(props: Props) {
  const { id } = await props.params;
  const offerResp = await getDocumentFromAdminDB<OfferWithId>("offers", id);
  const { data: offerData } = offerResp;

  const connectedOffersIds = offerData?.connectedOffers || [];
  const connectedOffersData: OfferWithId[] = [];
  for (const offerId of connectedOffersIds) {
    const { data: connectedOfferData } =
      await getDocumentFromAdminDB<OfferWithId>("offers", offerId);
    if (connectedOfferData) {
      connectedOffersData.push(connectedOfferData);
    }
  }

  const thumbnailUrl = isValidUrl(offerData?.thumbnail)
    ? offerData?.thumbnail
    : await getImageUrl(offerData?.thumbnail!);

  const connectedOffersThumbnails: Record<string, string | null> = {};
  for (const co of connectedOffersData) {
    if (isValidUrl(co.thumbnail)) {
      connectedOffersThumbnails[co.id] = co.thumbnail as string;
    } else if (co.thumbnail) {
      connectedOffersThumbnails[co.id] = await getImageUrl(co.thumbnail);
    } else {
      connectedOffersThumbnails[co.id] = null;
    }
  }

  const availableOffersToConnect = await getDocumentsFromAdminDB<OfferWithId>(
    "offers",
    (ref) => ref.where("legacyProductId", ">", ""),
  );

  return (
    <div>
      <SubpageHeading text="Edytuj warianty" />
      <div className="flex flex-col gap-4">
        <OfferProductInfo
          thumbnail={thumbnailUrl!}
          SKU={offerData?.SKU || ""}
          signature={offerData?.signature || ""}
        />
        <ConnectOffer
          offerId={offerData?.id!}
          connectedOffersIds={offerData?.connectedOffers || []}
          availableOffers={availableOffersToConnect!.filter(
            (o) => o.id !== offerData?.id && !connectedOffersIds.includes(o.id),
          )}
        />
        <section>
          <h3 className="text-lg font-medium mb-2">Powiązane oferty</h3>
          {connectedOffersData.length > 0 ? (
            connectedOffersData.map((offer) => (
              <div
                key={offer.id}
                className="p-4 border rounded mb-4 flex items-center gap-4"
              >
                {connectedOffersThumbnails[offer.id] ? (
                  <Image
                    src={connectedOffersThumbnails[offer.id]!}
                    alt={offer.signature}
                    width={100}
                    height={100}
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted-foreground/10 rounded" />
                )}
                <div>
                  <p className="font-medium">{offer.signature}</p>
                  <p className="text-sm text-muted-foreground">{offer.SKU}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Brak powiązanych ofert.</p>
          )}
        </section>
      </div>
    </div>
  );
}
