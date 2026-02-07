import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function OfferProductInfo({
  thumbnail,
  SKU,
  signature,
  className,
}: {
  thumbnail: string;
  SKU: string;
  signature: string;
  className?: string;
}) {
  return (
    <Card className={cn("w-fit py-3 px-6", className)}>
      <CardContent className="flex flex-row items-center gap-4">
        <Image
          src={thumbnail}
          alt={signature}
          width={200}
          height={200}
          className="rounded-xs size-32"
        />
        <div>
          <h3 className="font-medium text-xl">{signature}</h3>
          <p>
            <b className="font-medium">SKU:</b> {SKU}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
