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
      title: "Opinie klientów o kama-obuwie.pl",
      content: <ReviewsDialogContent />,
      hasCancelButton: false,
      confirmText: "Wróć do zakupów",
      onConfirm: closeDialog,
      confirmVariant: "important",
    });
  };

  const { currentBreakpoint } = useBreakpoint();

  return (
    <Card
      className={cn(
        "py-4 justify-between",
        className,
        isProductPage ? "gap-2" : "gap-4"
      )}
    >
      <CardHeader className="px-4 lg:px-6">
        <CardTitle className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 xl:size-8 text-success" />
          <h4 className="xl:text-2xl font-medium text-lg">
            99,7% zadowolonych klientów
          </h4>
        </CardTitle>
        <CardDescription>
          Na podstawie 600+ opinii{" "}
          {!isProductPage && (
            <span className="hidden sm:inline">
              z ostatnich 12 miesięcy na Allegro.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={`flex items-end ${isProductPage ? "justify-end" : ""} px-4`}
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
