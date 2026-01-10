import { allegroReviews } from "@/lib/reviews";
import { ThumbsUpIcon } from "lucide-react";

export default function ReviewsDialogContent() {
  return (
    <section className="flex flex-col gap-4">
      <header>
        <div className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 text-success md:size-8" />
          <h4 className="text-lg font-medium md:text-xl">
            99,7% pozytywnych opinii
          </h4>
        </div>
        <p>Na podstawie 600+ ocen z ostatnich 12 miesięcy.</p>
      </header>
      <article className="pb-4 border-b-1 border-secondary">
        <ul className="flex flex-col gap-2 max-h-[24svh] overflow-auto scrollbar pt-1 pr-2">
          {allegroReviews.map((review, index) => (
            <li
              key={index}
              className="flex items-center gap-2 border-success border-1 rounded-md px-3 py-2 bg-secondary/15"
            >
              <ThumbsUpIcon className="size-4 text-success flex-shrink-0" />"
              {review}"
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h5 className="font-medium 2xs:text-xl">
          Sprawdzony sprzedawca – 99,7% poleceń
        </h5>
        <p className="text-sm">
          Wszystkie opinie pochodzą z Allegro i są potwierdzone zakupem
        </p>
      </article>
    </section>
  );
}
