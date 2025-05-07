"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type DialogOptions = {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

type ConfirmDialogContextType = {
  showDialog: (options: DialogOptions) => void;
};

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );

  const showDialog = (options: DialogOptions) => {
    setDialogOptions(options);
  };

  const handleConfirm = () => {
    dialogOptions?.onConfirm();
    setDialogOptions(null);
  };

  const handleCancel = () => {
    if (dialogOptions?.onCancel) {
      dialogOptions.onCancel();
    }
    setDialogOptions(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ showDialog }}>
      {children}
      {dialogOptions ? (
        <ConfirmDialog
          open={true}
          description={dialogOptions?.description}
          message={dialogOptions.message}
          confirmText={dialogOptions.confirmText || "Tak"}
          cancelText={dialogOptions.cancelText || "Nie"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("Błąd wyświetlania okna dialogowego.");
  }
  return context;
}
