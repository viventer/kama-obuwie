"use client";

import { Button } from "@/components/ui/button";
import { ParsedProductDescription } from "@/helpers/productInfo";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

const COLLAPSED_HEIGHT_PX = 128;

export default function ProductAdvantages({
  advantages,
}: {
  advantages: ParsedProductDescription["advantages"];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | "auto">(COLLAPSED_HEIGHT_PX);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isExpanded) {
      setHeight(el.scrollHeight);
    } else {
      setHeight(COLLAPSED_HEIGHT_PX);
    }
  }, [isExpanded, advantages]);

  const toggleExpanded = () => {
    const el = contentRef.current;

    if (!el) {
      setIsExpanded((prev) => !prev);
      return;
    }

    if (isExpanded) {
      setHeight(el.scrollHeight);
      requestAnimationFrame(() => setIsExpanded(false));
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <article className="flex flex-col items-center gap-2">
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden flex flex-col gap-1 relative transition-[height] duration-500 ease-in-out"
        )}
        style={{ height }}
        onTransitionEnd={() => {
          if (isExpanded) setHeight("auto");
        }}
      >
        {advantages.map((advantage, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: advantage }}></p>
        ))}
      </div>
      <Button
        variant={"outline"}
        size={"sm"}
        className="w-full"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <ChevronDown
          className={cn(
            "mr-2 size-4 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
        {isExpanded ? "Zwiń zalety" : "Pokaż wszystkie zalety"}
      </Button>
    </article>
  );
}
