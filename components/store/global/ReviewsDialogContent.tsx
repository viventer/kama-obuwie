import { allegroReviews } from "@/lib/reviews";
import { ThumbsUpIcon } from "lucide-react";
import Image from "next/image";

export default function ReviewsDialogContent() {
  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <header>
        <div className="flex gap-2 items-center bg-card px-4 py-2 rounded-xs w-fit mb-4">
          <Image
            src={"/other/logoAllegro.svg"}
            alt="Allegro logo"
            width={48}
            height={48}
          />
          <p className="text-sm font-medium">kama-obuwie_pl</p>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 text-success md:size-8" />
          <h4 className="text-lg font-medium md:text-xl">
            99,5% pozytywnych opinii
          </h4>
        </div>
        <p>Na podstawie 800+ ocen sprzedawcy z ostatnich 12 miesięcy.</p>
      </header>
      <article className="pb-4 border-b-1 border-secondary h-[14rem]">
        <ul className="flex flex-col gap-2 overflow-auto scrollbar pt-1 pr-2 h-full">
          {allegroReviews.map((review, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-xs px-3 py-2 bg-card"
            >
              <ThumbsUpIcon className="size-4 text-success flex-shrink-0" />"
              {review}"
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h5 className="font-medium 2xs:text-xl">
          Sprawdzony sprzedawca – 99,4% poleceń
        </h5>
        <p className="text-sm">
          Prezentowane oceny dotyczą sprzedawcy kama-obuwie_pl i pochodzą z
          serwisu <b className="font-medium">allegro.pl</b>. Wszystkie opinie są
          potwierdzone zakupem i wystawione przez kupujących.
        </p>
      </article>
    </section>
  );
}
