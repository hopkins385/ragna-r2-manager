import { ConfirmDialogContext } from "@/context/ConfirmDialogContext";
import { useContext } from "react";

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within a ConfirmDialogProvider",
    );
  }

  return context;
}
