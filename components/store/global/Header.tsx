import Image from "next/image";
import HeaderBanner from "./HeaderBanner";
import IconButton from "@/components/adminPanel/global/IconButton";
import { ShoppingBasketIcon } from "lucide-react";

export default function Header() {
  return (
    <header className=" bg-background border-b-1 border-border sm:flex sm:justify-center">
      <div className="flex flex-col sm:flex-row  items-center gap-x-8 w-full sm:w-[90%] sm:max-w-[1440px]">
        <HeaderBanner />
        <section className="w-[90%] my-2 flex items-center gap-2 sm:order-first sm:w-fit  justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={64}
              height={64}
              className="size-8"
            />
            <h1 className="text-lg font-bold">KAMA</h1>
          </div>
          <IconButton className="sm:hidden">
            <ShoppingBasketIcon />
          </IconButton>
        </section>
        <div className="hidden sm:flex items-center justify-end flex-1">
          <IconButton>
            <ShoppingBasketIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
