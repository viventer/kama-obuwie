"use client";

import { EditedPhoto } from "@/firebase/schemas/productsSchemas";
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
import { Fragment, useEffect, useState } from "react";
import { getImageUrl } from "@/server-actions/images/images";
import { FormLabel } from "@/components/ui/form";

type EditedPhotoWithUrl = EditedPhoto & { url: string };

export default function PhotosReorder({
  photos,
  setPhotos,
}: {
  photos: EditedPhoto[];
  setPhotos: (photos: EditedPhoto[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [photosWithUrls, setPhotosWithUrls] = useState<EditedPhotoWithUrl[]>(
    []
  );
  const [variants, setVariants] = useState<string[]>([]);

  useEffect(() => {
    const fetchUrls = async () => {
      const colorVariantsNames = photos
        .map((photo) => photo.colorVariantName)
        .filter((name): name is string => name !== undefined);
      const uniqueColorVariantsNames = Array.from(new Set(colorVariantsNames));
      if (uniqueColorVariantsNames.length !== 0) {
        setVariants(uniqueColorVariantsNames);
      }
      const urls = await Promise.all(
        photos.map(async (photo) => {
          const url = (await getImageUrl(photo.filePath)) as string;
          return { ...photo, url: url };
        })
      );
      setPhotosWithUrls(urls);
    };

    fetchUrls();
  }, []);

  useEffect(() => {
    setPhotos(photosWithUrls);
  }, [photosWithUrls]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photosWithUrls.findIndex(
        (i) => i.filePath === active.id
      );
      const newIndex = photosWithUrls.findIndex((i) => i.filePath === over.id);
      const reordered = arrayMove(photosWithUrls, oldIndex, newIndex);
      setPhotosWithUrls(reordered);
    }
  };

  return (
    <div>
      <FormLabel className="mb-4">Zmień kolejność zdjęć</FormLabel>
      {photos.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((photo) => photo.filePath)}
            strategy={rectSortingStrategy}
          >
            {variants.map((variant) => {
              const photosForVariant = photosWithUrls.filter(
                (p) => p.colorVariantName === variant
              );

              return (
                <section
                  className="px-4 py-3 bg-primary/5 rounded-sm mb-4"
                  key={variant}
                >
                  <h2 className="text-foreground/85 mb-2">{variant}</h2>
                  <div className="flex flex-wrap gap-2">
                    {photosForVariant.map((photo, idx) => (
                      <div
                        key={photo.filePath}
                        className="flex-col items-center gap-2 relative"
                      >
                        <SortableImage id={photo.filePath} url={photo.url} />
                        <div className="absolute top-1 left-2 bg-primary/15 rounded-sm px-2 py-1 text-sm font-bold">
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
