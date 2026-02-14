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

  return (
    <Card className={cn("py-0 justify-between gap-0", className)}>
      <div className="flex gap-2 items-center bg-border px-3 py-2 rounded-xs rounded-tr-none rounded-bl-none w-fit">
        <Image
          src={"/other/logoAllegro.svg"}
          alt="Allegro logo"
          width={64}
          height={64}
          className="h-4 md:h-5 w-auto"
        />
        <p className="text-sm md:text-base font-medium">kama-obuwie_pl</p>
      </div>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-center lg:flex-1 py-4 lg:py-6">
        <CardHeader className="px-4 lg:px-6 flex-1">
          <CardTitle className="flex items-center gap-2">
            <ThumbsUpIcon className="size-6 xl:size-8 text-success" />
            <h3 className="xl:text-xl font-medium text-lg">
              99,6% pozytywnych opinii
            </h3>
          </CardTitle>
          <CardDescription>Na podstawie 600+ ocen sprzedawcy</CardDescription>
        </CardHeader>
        <CardContent
          className={`flex items-end  ${isProductPage ? "justify-end" : ""} px-4`}
        >
          <Button variant={"outline"} onClick={openModal}>
            Zobacz opinie
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
