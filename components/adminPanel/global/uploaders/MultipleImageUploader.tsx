"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  deleteImageFromStorage,
  getImagesUrls,
  uploadImageToStorage,
} from "@/server-actions/files/files";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

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
import { getNewFileName } from "../../../../helpers/files";

interface MultipleImageUploaderProps {
  setFilePaths: (filePaths: string[]) => void;
  filePaths: string[];
  folderPath: string;
  className?: string;
  setIsUploading?: (isUploading: boolean) => void;
  onImageDelete?: (filePath: string) => Promise<void>;
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
  onImageDelete,
  setIsUploading,
}: MultipleImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      const urls = await getImagesUrls(filePaths);

      if (!urls) {
        setImages([]);
        return;
      }

      const loaded: ImageItem[] = urls.map((url, idx) => ({
        filePath: filePaths[idx],
        url,
      }));

      setImages(loaded);
    })();
  }, []);

  useEffect(() => {
    setFilePaths(images.map((img) => img.filePath));
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Powiadom formularz o rozpoczęciu uploadu
      if (setIsUploading) setIsUploading(true);

      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const newName = getNewFileName(file.name);
          const base64 = buffer.toString("base64");
          const filePath = `${folderPath}/${newName}`;
          const url = await uploadImageToStorage(base64, filePath, file.type);
          return { filePath, url };
        } catch (err) {
          console.error(err);
          showToast("Błąd przesyłania zdjęcia.", "error");
          return null;
        }
      });

      Promise.all(uploadPromises)
        .then((results) => {
          const validResults = results.filter(
            (result): result is ImageItem => result !== null
          );

          setImages((prev) => [...prev, ...validResults]);

          // Powiadom formularz o zakończeniu uploadu
          if (setIsUploading) setIsUploading(false);
        })
        .catch(() => {
          // W przypadku błędu, również oznaczamy upload jako zakończony
          if (setIsUploading) setIsUploading(false);
        });
    },
    [folderPath, showToast, setIsUploading]
  );

  const onDropRejected = useCallback(() => {
    showToast("Nieprawidłowy plik lub za duży (max 10 MB).", "error");
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
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
      if (onImageDelete) {
        onImageDelete(filePath);
      } else {
        await deleteImageFromStorage(filePath);
      }
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
          isDragActive && "border-accent"
        )}
      >
        <input {...getInputProps()} />
        <div>
          {images.length > 0 ? (
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
                  {images.map((img, idx) => (
                    <SortableImage
                      key={idx}
                      id={img.filePath}
                      url={img.url}
                      onRemove={() => removeImage(img.filePath)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : isDragActive ? (
            <p>Upuść zdjęcia tutaj…</p>
          ) : (
            <p>Przeciągnij lub kliknij, aby wybrać zdjęcia</p>
          )}
        </div>
      </div>
    </div>
  );
}
