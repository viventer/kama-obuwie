import { useSortable } from "@dnd-kit/sortable";
import { TrashIcon } from "lucide-react";
import Image from "next/image";

export default function SortableImage({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: () => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-32 h-32 bg-primary/15 rounded overflow-hidden"
      {...attributes}
      {...listeners}
    >
      <Image src={url} alt="" fill className="object-cover" draggable={false} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2"
      >
        <TrashIcon className="size-4 text-destructive" />
      </button>
    </div>
  );
}
