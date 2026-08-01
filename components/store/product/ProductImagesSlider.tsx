"use client";

import { useState } from "react";
import ProductImagesSliderDialog from "./ProductImagesSliderDialog";
import ImagesSliderContent from "./ImagesSliderContent";

export default function ProductImagesSlider({
  imagesUrls,
  aiImagesUrls,
}: {
  imagesUrls: string[];
  aiImagesUrls?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="container w-full max-w-full md:w-[50vw] md:max-w-[600px] select-none">
      <ImagesSliderContent
        imagesUrls={imagesUrls}
        aiImagesUrls={aiImagesUrls}
        setOpen={setOpen}
      />
      <ProductImagesSliderDialog
        open={open}
        setOpen={setOpen}
        imagesUrls={imagesUrls}
        aiImagesUrls={aiImagesUrls}
      />
    </section>
  );
}
