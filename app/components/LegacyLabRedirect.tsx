"use client";

import { useEffect } from "react";

import { legacyLabDestination } from "../lib/legacy-navigation";

export function LegacyLabRedirect() {
  useEffect(() => {
    // The current root path reveals the static-export base path without
    // coupling browser navigation to a public runtime environment variable.
    const currentBasePath = window.location.pathname.replace(/\/+$/, "");
    const destination = legacyLabDestination(
      window.location.search,
      window.location.hash,
      currentBasePath,
    );

    if (destination !== null) window.location.replace(destination);
  }, []);

  return null;
}
