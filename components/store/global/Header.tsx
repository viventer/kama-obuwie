import Image from "next/image";
import HeaderBanner from "./HeaderBanner";

export default function Header() {
  return (
    <header className="sticky top-0 z-100 left-0 right-0 bg-background border-b-1 border-foreground">
      <div className="flex flex-col sm:flex-row  items-center gap-x-4 w-full">
        <HeaderBanner />
        <section className="w-[90%] my-2 flex items-center gap-2 sm:order-first sm:w-fit sm:pl-4">
          <div className="flex items-center gap-2">
            <Image
              src="logo.svg"
              alt="Logo"
              width={64}
              height={64}
              className="size-8"
            />
            <h1 className="text-lg font-bold">KAMA</h1>
          </div>
        </section>
      </div>
    </header>
  );
}
