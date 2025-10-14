"use client";

import { useState, useRef } from "react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, FreeMode, Navigation, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";
import { Swiper as SwiperType } from "swiper/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductImagesSlider({
  imagesUrls,
}: {
  imagesUrls: string[];
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="container w-full max-w-full md:w-[50vw] md:max-w-[600px] select-none">
      <div className="relative">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          loop={true}
          spaceBetween={10}
          effect="fade"
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[FreeMode, Navigation, Thumbs, EffectFade]}
          className="w-full aspect-[4/3] rounded-lg"
        >
          {imagesUrls.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="flex h-full items-center justify-center">
                <Image
                  src={image}
                  alt={""}
                  className="block h-full w-full object-contain bg-white"
                  height={1000}
                  width={1000}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Niestandardowe przyciski nawigacji - na środku głównego zdjęcia */}
        <Button
          variant="ghost"
          className="custom-prev absolute left-2 top-1/2 z-10 -translate-y-1/2 hover:-translate-x-1 transition-transform w-16 h-16"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft className="size-16 text-black/75" />
        </Button>

        <Button
          variant="ghost"
          className="custom-next absolute right-2 top-1/2 z-10 -translate-y-1/2 hover:translate-x-1 transition-transform w-16 h-16"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight className="size-16 text-black/75" />
        </Button>
      </div>

      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={12}
        slidesPerView={4}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbs mt-3 h-fit w-full "
      >
        {imagesUrls.map((image, index) => (
          <SwiperSlide key={index}>
            <button className="flex h-full w-full items-center justify-center">
              <Image
                src={image}
                alt={""}
                className="block w-full object-cover bg-white opacity-75 rounded-lg hover:opacity-100 transition-opacity cursor-pointer aspect-square"
                height={200}
                width={200}
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
