"use client";

import { useMemo } from "react";

export function useLocale() {
  // get the browser's locale
  const locale = useMemo(
    () => navigator.language || "en-US",
    [navigator.language],
  );
  return { locale };
}
