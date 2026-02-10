"use client";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThumbsUpIcon } from "lucide-react";
import ReviewsDialogContent from "./ReviewsDialogContent";
import ReviewsSlider from "./ReviewsSlider";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import Image from "next/image";

export default function ShopReviewsWidget({
  className,
  isProductPage = false,
}: {
  isProductPage?: boolean;
  className?: string;
}) {
  const { openDialog, closeDialog } = useDialogWindow();

  const openModal = () => {
    openDialog({
      title: "Opinie o nas na Allegro",
      content: <ReviewsDialogContent />,
      hasCancelButton: false,
      confirmText: "Wróć do zakupów",
      onConfirm: closeDialog,
      confirmVariant: "important",
    });
  };

  const { currentBreakpoint } = useBreakpoint();

  return (
    <Card className={cn("py-0 justify-between gap-2", className)}>
      <div className="flex gap-2 items-center bg-border px-3 py-2 rounded-sm rounded-tr-none rounded-bl-none w-fit mb-2">
        <Image
          src={"/other/logoAllegro.svg"}
          alt="Allegro logo"
          width={64}
          height={64}
        />
        <p className="text-base font-medium">kama-obuwie_pl</p>
      </div>
      <CardHeader className="px-4 lg:px-6">
        <CardTitle className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 xl:size-8 text-success" />
          <h3 className="xl:text-xl font-medium text-lg">
            99,6% pozytywnych opinii na Allegro
          </h3>
        </CardTitle>
        <CardDescription>Na podstawie 600+ ocen sprzedawcy</CardDescription>
      </CardHeader>
      <CardContent
        className={`flex items-end pb-4 ${isProductPage ? "justify-end" : ""} px-4`}
      >
        {isProductPage || currentBreakpoint.includes("s") ? (
          <Button variant={"outline"} onClick={openModal}>
            Zobacz opinie
          </Button>
        ) : (
          <ReviewsSlider className="hidden sm:flex" />
        )}
      </CardContent>
    </Card>
  );
}
