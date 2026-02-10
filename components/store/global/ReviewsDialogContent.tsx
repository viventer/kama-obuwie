import { allegroReviews } from "@/lib/reviews";
import { ThumbsUpIcon } from "lucide-react";
import Image from "next/image";

export default function ReviewsDialogContent() {
  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <header>
        <div className="flex gap-2 items-center bg-border px-3 py-2 rounded-sm w-fit mb-4">
          <Image
            src={"/other/logoAllegro.svg"}
            alt="Allegro logo"
            width={64}
            height={64}
          />
          <p className="text-base font-medium">kama-obuwie_pl</p>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 text-success md:size-8" />
          <h4 className="text-lg font-medium md:text-xl">
            99,6% pozytywnych opinii na Allegro
          </h4>
        </div>
        <p>Na podstawie 600+ ocen sprzedawcy z ostatnich 12 miesięcy.</p>
      </header>
      <article className="pb-4 border-b-1 border-secondary h-[17rem]">
        <ul className="flex flex-col gap-2 overflow-auto scrollbar pt-1 pr-2 h-full">
          {allegroReviews.map((review, index) => (
            <li
              key={index}
              className="flex items-center gap-2 border-success border-1 rounded-sm px-3 py-2 bg-secondary/15"
            >
              <ThumbsUpIcon className="size-4 text-success flex-shrink-0" />"
              {review}"
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h5 className="font-medium 2xs:text-xl">
          Sprawdzony sprzedawca – 99,6% poleceń
        </h5>
        <p className="text-sm">
          Wszystkie opinie pochodzą z serwisu{" "}
          <b className="font-medium">allegro.pl</b> i są potwierdzone zakupem
        </p>
      </article>
    </section>
  );
}
