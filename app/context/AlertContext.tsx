"use client";

import { createId } from "@paralleldrive/cuid2";
import { createContext, ReactNode, useCallback, useState } from "react";

export type AlertVariant = "default" | "destructive";

export interface AlertItem {
  id: string;
  title?: string;
  message: string;
  variant: AlertVariant;
}

interface AlertContextType {
  alerts: AlertItem[];
  showAlert: (
    message: string,
    options?: { title?: string; variant?: AlertVariant },
  ) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined,
);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback(
    (message: string, options?: { title?: string; variant?: AlertVariant }) => {
      const id = createId();
      const newAlert: AlertItem = {
        id,
        message,
        title: options?.title,
        variant: options?.variant || "default",
      };

      setAlerts((prev) => [...prev, newAlert]);

      // Auto-remove after 5 seconds if not destructive
      if (newAlert.variant !== "destructive") {
        setTimeout(() => {
          setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, 5000);
      }
    },
    [],
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{ alerts, showAlert, removeAlert, clearAlerts }}
    >
      {children}
    </AlertContext.Provider>
  );
}
