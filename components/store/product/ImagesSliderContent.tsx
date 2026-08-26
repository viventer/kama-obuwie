import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";
import { useEffect, useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper/types";
import { EffectFade, FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import AiImageBadge from "@/components/store/global/AiImageBadge";

export default function ImagesSliderContent({
  imagesUrls,
  aiImagesUrls,
  setOpen,
  isFullPage = false,
}: {
  imagesUrls: string[];
  aiImagesUrls?: string[];
  setOpen: (open: boolean) => void;
  isFullPage?: boolean;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const { currentBreakpoint } = useBreakpoint();
  const [smallImagesNumber, setSmallImagesNumber] = useState(4);

  useEffect(() => {
    if (currentBreakpoint == "xs") {
      setSmallImagesNumber(3);
    } else if (currentBreakpoint.includes("s")) {
      setSmallImagesNumber(4);
    } else {
      setSmallImagesNumber(6);
    }
  }, [currentBreakpoint]);

  return (
    <>
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
          modules={[FreeMode, Navigation, Thumbs, EffectFade, Zoom]}
          zoom={{ maxRatio: 3 }}
          className="w-full  rounded-xs "
        >
          {imagesUrls.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative flex h-full items-center justify-center"
                onClick={() => {
                  if (!isFullPage) setOpen(true);
                }}
              >
                {aiImagesUrls?.includes(image) && <AiImageBadge />}
                <div className="swiper-zoom-container flex items-center justify-center">
                  <Image
                    src={image}
                    alt={""}
                    className={`block w-full ${isFullPage ? " md:h-[70vh] md:w-auto" : "h-full"} object-contain bg-white rounded-xs max-w-[400px]  md:max-w-full aspect-square`}
                    height={1000}
                    width={1000}
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority={index === 0}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Niestandardowe przyciski nawigacji - na środku głównego zdjęcia */}
        <Button
          variant="ghost"
          className="custom-prev absolute left-2 top-1/2 z-10 -translate-y-1/2 hover:-translate-x-1 transition-transform w-12 h-12 bg-white/50"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft className="size-12 text-black/75" />
        </Button>

        <Button
          variant="ghost"
          className="custom-next absolute right-2 top-1/2 z-10 -translate-y-1/2 hover:translate-x-1 transition-transform w-12 h-12 bg-white/50"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight className="size-12 text-black/75" />
        </Button>
      </div>

      <Swiper
        onSwiper={setThumbsSwiper}
        loop={true}
        spaceBetween={12}
        slidesPerView={isFullPage ? smallImagesNumber : 4}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className={`thumbs ${isFullPage ? "max-w-[900px]" : "hidden!"} w-full mt-3 h-fit   md:flex!`}
      >
        {imagesUrls.map((image, index) => (
          <SwiperSlide key={index} className="">
            <button
              className={`flex ${isFullPage ? "" : "h-full w-full"}  items-center justify-center`}
            >
              <Image
                src={image}
                alt={""}
                className={`block ${isFullPage ? "w-[14vh]" : "w-full"}  object-cover bg-white opacity-75 rounded-xs hover:opacity-100 transition-opacity cursor-pointer aspect-square`}
                height={200}
                width={200}
                sizes="200px"
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
