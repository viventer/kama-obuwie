"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImagesSliderContent from "./ImagesSliderContent";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function ProductImagesSliderDialog({
  open,
  setOpen,
  imagesUrls,
  aiImagesUrls,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  imagesUrls: string[];
  aiImagesUrls?: string[];
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Zdjęcia produktu</DialogTitle>
      <DialogContent
        className="w-[100vw]! max-w-[100vw]! 
      h-fit md:h-[100vh] py-14"
      >
        <ImagesSliderContent
          imagesUrls={imagesUrls}
          aiImagesUrls={aiImagesUrls}
          setOpen={setOpen}
          isFullPage={true}
        />
      </DialogContent>
    </Dialog>
  );
}
