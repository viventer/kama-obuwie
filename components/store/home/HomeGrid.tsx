"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomeGrid() {
  const router = useRouter();

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-5 grid-rows-4 gap-4 h-96 sm:grid-rows-3">
        <Card className="col-span-5 row-span-1 sm:col-span-2 sm:row-span-2 flex flex-row justify-center items-center bg-brand/25 px-4 gap-4">
          <GraduationCap className="min-w-8 min-h-8 lg:min-w-12 lg:min-h-12 text-brand" />
          <h3 className="text-lg lg:text-2xl font-semibold">
            Wszystko na nowy rok szkolny
          </h3>
        </Card>

        <Card className="col-span-5 row-span-1 flex flex-row justify-between items-center px-4 sm:col-span-3">
          <div className="flex items-center gap-4">
            <Image
              src={"/main-grid/trampki.jpg"}
              alt="trampki"
              className="h-12 w-12 rounded-xl sm:h-16 sm:w-16"
              width={128}
              height={128}
            />
            <h3 className="text-xl font-semibold">Trampki</h3>
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              router.push("/listing?category=TLNV6amSFBmC0b2iazJO")
            }
            className="hover:translate-x-1 transition-transform"
          >
            <ArrowRight className="size-6" />
          </Button>
        </Card>

        <Card className="col-span-5 row-span-1 flex flex-row justify-between items-center px-4 sm:col-span-3">
          <div className="flex items-center gap-4 ">
            <Image
              src={"/main-grid/halowki.jpeg"}
              alt="halówki"
              className="h-12 w-12 rounded-xl sm:h-16 sm:w-16"
              width={128}
              height={128}
            />
            <h3 className="text-lg font-semibold">Halówki</h3>
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              router.push("/listing?category=ejLcsifWXnMVszePrYc0")
            }
            className="hover:translate-x-1 transition-transform"
          >
            <ArrowRight className="size-6" />
          </Button>
        </Card>

        <Card className="col-span-5 row-span-1 flex flex-row justify-between items-center px-4 sm:col-span-3">
          <div className="flex items-center gap-4">
            <Image
              src={"/main-grid/sportowe.jpg"}
              alt="sportowe"
              className="h-12 w-12 rounded-xl sm:h-16 sm:w-16"
              width={128}
              height={128}
            />
            <h3 className="text-lg font-semibold">Sportowe</h3>
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              router.push("/listing?category=ejLcsifWXnMVszePrYc0")
            }
            className="hover:translate-x-1 transition-transform"
          >
            <ArrowRight className="size-6" />
          </Button>
        </Card>

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
