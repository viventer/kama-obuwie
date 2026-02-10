import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { allegroReviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { ThumbsUpIcon } from "lucide-react";

export default function ReviewsSlider({ className }: { className?: string }) {
  return (
    <Carousel
      className={cn("overflow-clip max-w-xl xl:max-w-3xl", className)}
      plugins={[
        Autoplay({
          delay: 14000,
        }),
      ]}
      opts={{
        align: "end",
        loop: true,
      }}
    >
      <CarouselContent>
        {allegroReviews.map((review, index) => (
          <CarouselItem key={index} className="items-end flex">
            <div className="flex items-center gap-2 border-success border-1 rounded-xs px-4 py-2">
              <ThumbsUpIcon className="size-4 text-success" />
              {review}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
