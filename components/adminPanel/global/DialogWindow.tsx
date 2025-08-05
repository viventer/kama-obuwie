"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";

interface DialogWindowProps {
  triggerElement?: ReactNode;
  title: string;
  description?: string;
  content: ReactNode;
  hasCancelButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function DialogWindow({
  triggerElement,
  title,
  description,
  content,
  hasCancelButton = true,
  cancelText = "Anuluj",
  confirmText = "Zatwierdź",
  onConfirm,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  confirmVariant = "default",
}: DialogWindowProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Użyj kontrolowanego stanu jeśli został przekazany, w przeciwnym razie użyj wewnętrznego
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const dialogContent = (
    <DialogContent className="max-h-[90svh]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      {content}

      <DialogFooter>
        {hasCancelButton && (
          <DialogClose asChild>
            <Button variant="destructive">{cancelText}</Button>
          </DialogClose>
        )}
        {onConfirm && (
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );

  // Jeśli jest element wyzwalający, użyj go z DialogTrigger
  if (triggerElement) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // Jeśli nie ma elementu wyzwalającego, renderuj tylko dialog (kontrolowany zewnętrznie)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
