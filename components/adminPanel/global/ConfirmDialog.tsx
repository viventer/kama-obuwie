"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AlertConfirmProps {
  open: boolean;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  hasCancelButton?: boolean;
  variant?: "success" | "error" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  message,
  description,
  confirmText = "Tak",
  cancelText = "Nie",
  hasCancelButton = true,
  variant = "info",
  onConfirm,
  onCancel,
}: AlertConfirmProps) {
  const borderColorClass =
    variant === "success"
      ? "border-green-500"
      : variant === "error"
      ? "border-destructive"
      : "border-primary";

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent
        className={`${borderColorClass} max-w-[90%] lg:max-w-[600px]`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex">{message}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="flex w-full justify-start text-left">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center flex-row gap-4">
          {hasCancelButton && (
            <AlertDialogCancel
              onClick={onCancel}
              className="border-[0.1rem] border-solid border-primary bg-transparent m-0 hover:bg-primary"
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={onConfirm} className="bg-primary">
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
