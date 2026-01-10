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

export default function ShopReviewsWidget({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn("py-4 gap-2 max-w-lg", className)}>
      <CardHeader className="px-2 2xs:px-4 lg:px-6">
        <CardTitle className="flex items-center gap-2">
          <ThumbsUpIcon className="size-6 xl:size-8 text-success" />
          <h4 className="xl:text-2xl font-medium text-lg">
            99,7% zadowolonych klientów
          </h4>
        </CardTitle>
        <CardDescription>Na podstawie 600+ opinii</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end px-2 2xs:px-4">
        <Button variant={"outline"}>Zobacz opinie</Button>
      </CardContent>
    </Card>
  );
}
