"use client";

import { useAlert } from "@/hooks/useAlert";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          className="relative pr-12 shadow-lg"
        >
          {alert.variant === "destructive" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
          <AlertDescription>{alert.message}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => removeAlert(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
}
