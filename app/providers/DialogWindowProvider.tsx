"use client";

import { ReactNode, createContext, useContext, useState } from "react";

export interface DialogConfig {
  title: string;
  description?: string;
  content: ReactNode;
  hasCancelButton?: boolean;
  cancelText?: string;
  cancelVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "important";
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "important";
}

interface DialogContextType {
  isOpen: boolean;
  config: DialogConfig | null;
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogWindowProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);

  const openDialog = (dialogConfig: DialogConfig) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Opóźnij czyszczenie konfiguracji do momentu zakończenia animacji zamknięcia
    setTimeout(() => setConfig(null), 200);
  };

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        config,
        openDialog,
        closeDialog,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialogWindow() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error(
      "useDialogWindow must be used within a DialogWindowProvider"
    );
  }
  return context;
}
