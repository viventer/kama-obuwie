"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  deleteImageFromStorage,
  getImageUrl,
  uploadImageToStorage,
} from "@/server-actions/images/images";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { getNewFileName } from "./helpers/files";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableImage from "./SortableImage";

interface MultipleImageUploaderProps {
  setFilePaths: (filePaths: string[]) => void;
  filePaths: string[];
  folderPath: string;
  className?: string;
}

interface ImageItem {
  filePath: string;
  url: string;
}

export default function MultipleImageUploader({
  filePaths,
  className,
  setFilePaths,
  folderPath,
}: MultipleImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      const loaded: ImageItem[] = [];
      for (const path of filePaths) {
        const url = await getImageUrl(path);
        if (url) loaded.push({ filePath: path, url });
      }
      setImages(loaded);
    })();
  }, []);

  useEffect(() => {
    setFilePaths(images.map((img) => img.filePath));
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async (file) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const newName = getNewFileName(file.name);
          const base64 = buffer.toString("base64");
          const filePath = `${folderPath}/${newName}`;
          const url = await uploadImageToStorage(base64, filePath, file.type);
          setImages((prev) => {
            const updated = [...prev, { filePath, url }];
            return updated;
          });
          showToast("Zdjęcie przesłane.", "success");
        } catch (err) {
          console.error(err);
          showToast("Błąd przesyłania zdjęcia.", "error");
        }
      });
    },
    [folderPath, showToast]
  );

  const onDropRejected = useCallback(() => {
    showToast("Nieprawidłowy plik lub za duży (max 5 MB).", "error");
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.filePath === active.id);
      const newIndex = images.findIndex((i) => i.filePath === over.id);
      setImages((prev) => {
        const reordered = arrayMove(prev, oldIndex, newIndex);
        return reordered;
      });
    }
  };

  const removeImage = async (filePath: string) => {
    try {
      await deleteImageFromStorage(filePath);
      setImages((prev) => {
        const updated = prev.filter((i) => i.filePath !== filePath);
        return updated;
      });
      showToast("Zdjęcie usunięte.", "success");
    } catch (err) {
      console.error(err);
      showToast("Błąd usuwania zdjęcia.", "error");
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded p-4 text-center cursor-pointer",
          isDragActive && "border-blue-500"
        )}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? "Upuść zdjęcia tutaj…"
            : "Przeciągnij lub kliknij, aby wybrać zdjęcia"}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.filePath)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <SortableImage
                key={img.filePath}
                id={img.filePath}
                url={img.url}
                onRemove={() => removeImage(img.filePath)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
