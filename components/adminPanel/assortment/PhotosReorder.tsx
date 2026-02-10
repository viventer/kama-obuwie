"use client";

import { EditedPhotoWithUrl } from "@/firebase/schemas/productsSchemas";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SortableImage from "../global/uploaders/SortableImage";
import { useEffect, useState } from "react";

export default function PhotosReorder({
  photos,
  setPhotos,
  readonly = false,
}: {
  photos: EditedPhotoWithUrl[];
  setPhotos?: (photos: EditedPhotoWithUrl[]) => void;
  readonly?: boolean;
}) {
  if (!readonly && !setPhotos) {
    throw new Error(
      "If PhotosReorder is not readonly, photos and setPhotos props are required.",
    );
  }

  const sensors = useSensors(useSensor(PointerSensor));
  const [photosWithUrls, setPhotosWithUrls] =
    useState<EditedPhotoWithUrl[]>(photos);
  const uniqueVariants = Array.from(
    new Set(
      photos.map((p) => p.colorVariantName).filter((n): n is string => !!n),
    ),
  );

  if (uniqueVariants.length === 0) {
    uniqueVariants.push("");
  }

  useEffect(() => {
    if (!readonly && setPhotos) {
      setPhotos(photosWithUrls);
    }
  }, [photosWithUrls]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photosWithUrls.findIndex(
        (i) => i.filePath === active.id,
      );
      const newIndex = photosWithUrls.findIndex((i) => i.filePath === over.id);
      const reordered = arrayMove(photosWithUrls, oldIndex, newIndex);
      setPhotosWithUrls(reordered);
    }
  };

  return (
    <div className={`${!readonly ? "mb-8" : ""}`}>
      {!readonly && (
        <h3 className="mb-4 font-bold">Zmień kolejność zdjęć w ofercie</h3>
      )}
      {photos.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((photo) => photo.filePath)}
            strategy={rectSortingStrategy}
            disabled={readonly}
          >
            {uniqueVariants.map((variant, index) => {
              const photosForVariant = photosWithUrls.filter(
                (p) => p.colorVariantName === variant,
              );

              return (
                <section
                  className="px-4 py-3 bg-primary/5 rounded-xs mb-4"
                  key={index}
                >
                  {variant && (
                    <h2 className="text-foreground/85 mb-2">{variant}</h2>
                  )}
                  <div className="flex sm:flex-wrap gap-2 overflow-x-auto scrollbar">
                    {photosForVariant.map((photo, idx) => (
                      <div
                        key={photo.filePath}
                        className="flex-col items-center gap-2 relative"
                      >
                        <SortableImage id={photo.filePath} url={photo.url} />
                        <div className="absolute top-1 left-2 bg-black/50 rounded-xs px-2 py-1 text-sm font-bold text-white">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </SortableContext>
        </DndContext>
      ) : null}
    </div>
  );
}
