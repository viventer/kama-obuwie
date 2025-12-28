"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageIcon, StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type HomeGridCategory = {
  id: string;
  name: string;
  rootCategory: string;
  displayName: string;
  imageSrc: string;
};

export type HomeGridProps = {
  icon: React.ReactNode;
  title: string;
  categories: HomeGridCategory[];
};

export default function HomeGrid({ icon, title, categories }: HomeGridProps) {
  const router = useRouter();

  return (
    <div className="w-full mt-2 mb-16">
      <div className="grid grid-cols-5 grid-rows-4 gap-4 h-96 sm:grid-rows-3">
        <Card className="col-span-5 row-span-1 sm:col-span-2 sm:row-span-2 flex flex-row justify-center items-center bg-brand/25 px-4 gap-4">
          <div className="min-w-8 min-h-8 lg:min-w-12 lg:min-h-12 text-brand">
            {icon}
          </div>
          <h3 className="text-lg lg:text-2xl font-semibold">{title}</h3>
        </Card>

        {categories.map((category) => (
          <Card
            key={category.id || category.displayName}
            className="col-span-5 row-span-1 flex flex-row justify-between items-center px-4 sm:col-span-3 cursor-pointer transition-colors duration-200 hover:bg-secondary/50 active:bg-secondary/75"
            onClick={() => router.push(`/listing?categoryId=${category.id}`)}
          >
            <div className="flex items-center gap-4">
              <Image
                src={category.imageSrc}
                alt={category.displayName}
                className="h-12 w-12 rounded-xl sm:h-16 sm:w-16"
                width={128}
                height={128}
              />
              <h3 className="text-lg font-semibold">{category.displayName}</h3>
            </div>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/listing?categoryId=${category.id}`);
              }}
              className="hover:translate-x-1 transition-transform"
            >
              <ArrowRight className="size-6" />
            </Button>
          </Card>
        ))}

        <Card className="col-span-2 row-span-1 hidden sm:flex flex-row justify-center items-center px-4 bg-brand/25 gap-4">
          <div className="flex items-center gap-4 justify-center">
            <PackageIcon className="hidden md:block min-w-8 min-h-8 text-brand" />
            <h3 className="text-lg lg:text-xl font-semibold">
              Z darmową i szybką wysyłką
            </h3>
          </div>
        </Card>
      </div>
    </div>
  );
}
