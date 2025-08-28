"use client";

import {
  BanknoteIcon,
  ClockIcon,
  CreditCardIcon,
  HouseIcon,
  PackageIcon,
  TruckIcon,
  UndoIcon,
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function HeaderBanner() {
  const banners = [
    {
      text: "Darmowa dostawa od 55 zł",
      icon: TruckIcon,
    },
    {
      text: "Darmowy zwrot przez Paczkomat",
      icon: UndoIcon,
    },
    {
      text: "Dostawa do Paczkomatu",
      icon: PackageIcon,
    },
    {
      text: "Dostawa InPost Kurier",
      icon: HouseIcon,
    },
    {
      text: "Płatność online lub przy odbiorze",
      icon: CreditCardIcon,
    },
    {
      text: "30 dni na darmowy zwrot",
      icon: ClockIcon,
    },
  ];

  return (
    <Carousel
      className="w-full bg-brand/15 px-4 py-2 border-foreground sm:bg-background sm:w-[360px] sm:border-l-1 overflow-clip"
      plugins={[
        Autoplay({
          delay: 10000,
        }),
      ]}
      opts={{
        align: "center",
        loop: true,
      }}
    >
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index} className="w-fit">
            <div className="flex items-center justify-center gap-2 sm:justify-start sm:w-fit">
              <banner.icon className="size-5" />
              {banner.text}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
