"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";

export default function GlobalDialogWindow() {
  const { isOpen, config, closeDialog } = useDialogWindow();

  if (!config) return null;

  const handleConfirm = () => {
    config.onConfirm?.();
    closeDialog();
  };

  const handleCancel = () => {
    config.onCancel?.();
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="max-h-[90svh]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {config.description && (
            <DialogDescription>{config.description}</DialogDescription>
          )}
        </DialogHeader>

        {config.content}

        <DialogFooter>
          {config.hasCancelButton === true && (
            <Button variant="destructive" onClick={handleCancel}>
              {config.cancelText || "Anuluj"}
            </Button>
          )}
          {config.onConfirm && (
            <Button
              variant={config.confirmVariant || "default"}
              onClick={handleConfirm}
            >
              {config.confirmText || "Zatwierdź"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
