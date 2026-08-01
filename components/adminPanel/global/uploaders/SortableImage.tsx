"use client";

import { useSortable } from "@dnd-kit/sortable";
import { TrashIcon } from "lucide-react";
import Image from "next/image";
import AiButton from "./AiButton";
import { Button } from "@/components/ui/button";

export default function SortableImage({
  id,
  url,
  onRemove,
  isAiCoCreated,
  onToggleAiCoCreated,
  aiToggleDisabled,
}: {
  id: string;
  url: string;
  onRemove?: () => void;
  isAiCoCreated?: boolean;
  onToggleAiCoCreated?: () => void;
  aiToggleDisabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    touchAction: "none",
  };

  const showAiToggle =
    onToggleAiCoCreated !== undefined || isAiCoCreated !== undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-32 h-32 bg-primary/15 rounded overflow-hidden"
      {...attributes}
      {...listeners}
    >
      <Image src={url} alt="" fill className="object-cover" draggable={false} />
      {showAiToggle && (
        <AiButton
          isAiCoCreated={isAiCoCreated}
          onToggle={onToggleAiCoCreated}
          disabled={aiToggleDisabled}
        />
      )}
      {onRemove && (
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-0.5 right-0.5 bg-background/70 hover:bg-background/100 rounded-full"
        >
          <TrashIcon className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
