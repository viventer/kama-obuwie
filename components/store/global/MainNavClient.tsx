"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import * as React from "react";
import NavOptionContent from "./NavOptionContent";

const mainCategories = [
  { label: "Męskie", rootCategory: "obuwie męskie" },
  { label: "Damskie", rootCategory: "obuwie damskie" },
  { label: "Dziecięce", rootCategory: "obuwie dziecięce" },
] as const;

export default function MainNavClient({
  categoriesByRoot,
}: {
  categoriesByRoot: Record<string, CategoryWithId[]>;
}) {
  const [value, setValue] = React.useState<string>("");
  const isOpen = value !== "";
  const [overlayTop, setOverlayTop] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const barEl = rootRef.current?.closest(
      "[data-main-nav-bar]",
    ) as HTMLElement | null;

    if (!barEl) {
      return;
    }

    const update = () => {
      setOverlayTop(
        Math.max(0, Math.round(barEl.getBoundingClientRect().bottom)),
      );
    };

    update();

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(barEl);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="w-[100%] max-w-[1440px] flex justify-start">
      <div
        style={{ top: overlayTop }}
        className={
          "fixed left-0 right-0 bottom-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity duration-150 " +
          (isOpen ? "opacity-100" : "opacity-0 pointer-events-none")
        }
        onClick={() => setValue("")}
        aria-hidden
      />

      <NavigationMenu
        className="justify-center z-50 2xs:justify-start max-w-[1440px] "
        value={value}
        onValueChange={setValue}
      >
        <p className="hidden font-bold pr-6 sm:inline">Obuwie</p>
        <NavigationMenuList className=" w-full gap-0 2xs:w-fit 2xs:ml-[5%] sm:ml-0">
          {mainCategories.map((mainCategory) => {
            const subcategories =
              categoriesByRoot[mainCategory.rootCategory] || [];

            if (subcategories.length === 0) {
              return null;
            }

            return (
              <NavigationMenuItem
                key={mainCategory.rootCategory}
                value={mainCategory.rootCategory}
                className="w-full"
              >
                <NavigationMenuTrigger className="rounded-xs font-medium px-3 capitalize text-base">
                  {mainCategory.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background md:!max-w-[600px] !w-[100svw] bottom-0 relative h-fit overflow-auto scrollbar  ">
                  <NavOptionContent subcategories={subcategories} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
