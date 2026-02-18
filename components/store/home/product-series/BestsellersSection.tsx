import type { Bestsellers } from "@/lib/bestsellers";

export default function BestsellersSection({
  bestsellersData,
}: {
  bestsellersData: Bestsellers;
}) {
  return (
    <article>
      <h3 className="text-xl font-medium md:text-2xl capitalize">
        Hity sezonu
      </h3>
      <div className="overflow-x-auto scrollbar"></div>
    </article>
  );
}
