"use client";

import { useState, useRef } from "react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";

import { Swiper as SwiperType } from "swiper/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectProductDialog from "./ProductImagesSliderDialog";
import ImagesSliderContent from "./ImagesSliderContent";

export default function ProductImagesSlider({
  imagesUrls,
}: {
  imagesUrls: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="container w-full max-w-full md:w-[50vw] md:max-w-[600px] select-none">
      <ImagesSliderContent imagesUrls={imagesUrls} setOpen={setOpen} />
      <SelectProductDialog
        open={open}
        setOpen={setOpen}
        imagesUrls={imagesUrls}
      />
    </section>
  );
}
