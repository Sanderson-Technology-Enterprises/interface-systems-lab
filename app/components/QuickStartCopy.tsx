"use client";

import { useEffect, useRef, useState } from "react";

import { CopyIcon } from "./Icons";

type QuickStartCopyProps = {
  command: string;
};

export function QuickStartCopy({ command }: QuickStartCopyProps) {
  const [status, setStatus] = useState("Copy command");
  const resetTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== undefined) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const copyCommand = async () => {
    if (resetTimeoutRef.current !== undefined) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(command);
      setStatus("Copied");
      resetTimeoutRef.current = window.setTimeout(() => {
        setStatus("Copy command");
      }, 1_800);
    } catch {
      setStatus("Copy manually");
    }
  };

  return (
    <div className="quick-start-command ly-stack ly-gap-4">
      <pre tabIndex={0}>
        <code>{command}</code>
      </pre>
      <button
        className="copy-button interactive-surface site-action"
        data-surface-variant="subtle"
        data-surface-level="1"
        type="button"
        aria-label={`${status}: npm install command`}
        onClick={copyCommand}
      >
        <CopyIcon />
        <span>{status}</span>
      </button>
      <span
        className="ly-visually-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "Copied" ? "Install command copied to the clipboard." : ""}
      </span>
    </div>
  );
}
