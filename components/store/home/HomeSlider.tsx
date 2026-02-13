"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { homeSliderBanners } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

export default function HomeSlider({ className }: { className?: string }) {
  return (
    <section className={cn("relative", className)}>
      <Carousel
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
          {homeSliderBanners.map((banner, index) => (
            <CarouselItem key={index}>
              <div className="relative">
                <div className="absolute top-2 left-2 w-[calc(100%-1rem)] md:top-3 md:left-4 md:w-fit bg-black/30 text-white backdrop-blur-xs px-4 py-2 md:px-8 md:py-4 rounded-xs">
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
        className="w-full mt-2 md:mt-0 md:w-fit md:absolute md:right-4 md:bottom-3 static text-xl font-medium md:text-3xl md:px-12 md:py-8 uppercase z-999999"
      >
        Sprawdź
      </Button>
    </section>
  );
}
