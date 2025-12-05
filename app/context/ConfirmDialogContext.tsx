"use client";

import { createContext, ReactNode, useCallback, useState } from "react";

export interface ConfirmDialogOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmDialogContextType extends ConfirmDialogState {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

export const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "default",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || "Continue",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm, ...dialogState }}>
      {children}
    </ConfirmDialogContext.Provider>
  );
}
