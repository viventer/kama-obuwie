"use client";

import { useToast } from "@/hooks/useToast";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

import Image from "next/image";
import { DeleteIcon, ImageIcon, ReplaceIcon } from "lucide-react";
import {
  deleteImageFromStorage,
  getImageUrl,
  uploadImageToStorage,
} from "@/server-actions/images/images";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  setFileName: (fileName: string) => void;
  fileName: string;
  folderPath: string;
  className?: string;
}

export default function ImageUploader({
  fileName,
  setFileName,
  folderPath,
  className,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      const imageUrl = await getImageUrl(fileName, folderPath);
      if (imageUrl) {
        setImageUrl(imageUrl);
      }
    })();
  }, [fileName]);

  const { showToast } = useToast();

  const onDropRejected = useCallback(() => {
    showToast("Plik jest za duży! Maksymalny rozmiar to 5 MB.", "error");
  }, [showToast]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      (async function () {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const bufferString = buffer.toString("base64");

          if (fileName) {
            await deleteImageFromStorage(fileName, folderPath);
          }
          setFileName(file.name);

          const newImageUrl = await uploadImageToStorage(
            bufferString,
            folderPath,
            file.name,
            file.type
          );

          console.log("Uploaded image URL:", newImageUrl);

          setImageUrl(newImageUrl);

          showToast("Zdjęcie zostało przesłane.", "success");
        } catch (err) {
          showToast("Błąd przesyłania zdjęcia", "error");
          console.error(err);
        }
      })();
    },
    [fileName, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleDeleteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!fileName) return;
    try {
      deleteImageFromStorage(fileName, folderPath);
      setImageUrl("");
      setFileName("");
      showToast("Obrazek został usunięty", "success");
    } catch (error) {
      showToast("Błąd usuwania obrazka", "error");
      console.error("Błąd usuwania obrazka:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded text-center cursor-pointer w-full aspect-[3/2] flex items-center justify-center relative"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Upuść obrazek tutaj...</p>
        ) : !imageUrl ? (
          <div className="flex items-center gap-2 m-4">
            <ImageIcon className="size-20 hidden sm:block" />
            <p className="text-left">
              Przeciągnij i upuść obrazek lub kliknij, aby wybrać
            </p>
          </div>
        ) : (
          <>
            <Image
              src={imageUrl}
              alt="Uploaded image"
              layout="fill"
              className="w-full aspect-[3/2] object-contain"
            />
            <div className="text-3xl z-10 w-full h-full bg-transparent backdrop-brightness-100 items-center justify-center flex relative transition-all ease-in-out opacity-0 hover:backdrop-brightness-[25%] hover:opacity-100">
              <button
                className="absolute right-0 top-0 m-2 hover:text-destructive"
                onClick={handleDeleteImage}
              >
                <DeleteIcon className="size-8 " />
              </button>
              <button className="hover:text-accent">
                <ReplaceIcon className="size-12 " />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
