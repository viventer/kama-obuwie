"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

import { Button } from "./button";

type ExpandableElementProps = {
  children: ReactNode;
  collapsedHeight: number;
  expandText: string;
  collapseText: string;
  className?: string;
  contentClassName?: string;
  buttonClassName?: string;
};

export default function ExpandableElement({
  children,
  collapsedHeight,
  expandText,
  collapseText,
  className,
  contentClassName,
  buttonClassName,
}: ExpandableElementProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | "auto">(collapsedHeight);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const scrollHeight = el.scrollHeight;
      const overflowing = scrollHeight > collapsedHeight + 1;
      setIsOverflowing(overflowing);

      if (!overflowing) {
        setHeight("auto");
        return;
      }

      if (isExpanded) {
        if (height !== "auto") setHeight(scrollHeight);
      } else {
        setHeight(collapsedHeight);
      }
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight, isExpanded]);

  const toggle = () => {
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
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden flex flex-col gap-1 relative transition-[height] duration-500 ease-in-out shadow-background inset-shadow-2xl",
          contentClassName,
        )}
        style={{ height }}
        onTransitionEnd={() => {
          if (isExpanded) setHeight("auto");
        }}
      >
        {children}

        {!isExpanded && isOverflowing && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent via-background/60 to-background"
          />
        )}
      </div>

      {isOverflowing && (
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn("w-full", buttonClassName)}
          onClick={toggle}
          aria-expanded={isExpanded}
        >
          <ChevronDown
            className={cn(
              "mr-2 size-4 transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
          />
          {isExpanded ? collapseText : expandText}
        </Button>
      )}
    </div>
  );
}
