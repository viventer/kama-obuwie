"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HomeSliderBanner } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeSlider({
  banners,
  className,
}: {
  banners: HomeSliderBanner[];
  className?: string;
}) {
  const router = useRouter();
  const [api, setApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateIndex = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    updateIndex();
    api.on("select", updateIndex);
    api.on("reInit", updateIndex);

    return () => {
      api.off("select", updateIndex);
      api.off("reInit", updateIndex);
    };
  }, [api]);

  const activeBanner = banners[activeIndex] ?? banners[0];
  const destinationCategoryId = activeBanner?.destination?.categoryId;
  const destinationHref = destinationCategoryId
    ? `/listing/${destinationCategoryId}`
    : null;

  return (
    <section className={cn("relative", className)}>
      <Carousel
        // plugins={[
        //   Autoplay({
        //     delay: 14000,
        //   }),
        // ]}
        opts={{
          align: "end",
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <div className="relative">
                <div className="absolute top-1 left-2 right-2 w-[calc(100%-1rem)] md:top-3 md:left-4 md:w-fit bg-black/30 text-white backdrop-blur-xs px-3 py-2 md:px-8 md:py-4 rounded-xs">
                  <h2 className="font-bold text-xl md:text-3xl">
                    {banner.heading}
                  </h2>
                  <p className="text-sm md:text-lg">{banner.subheading}</p>
                </div>
                <Image
                  src={banner.imageSrc}
                  alt=""
                  width={1600}
                  height={450}
                  className="rounded-xs w-full aspect-[3/2] md:aspect-[24/9] object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Button
        variant={"important"}
        className="md:w-fit absolute right-2 bottom-1 md:right-4 md:bottom-3  text-xl font-medium md:text-3xl md:px-12 md:py-8 uppercase z-999999"
        disabled={!destinationHref}
        onClick={() => {
          if (!destinationHref) return;
          router.push(destinationHref);
        }}
      >
        Sprawdź
      </Button>
    </section>
  );
}
