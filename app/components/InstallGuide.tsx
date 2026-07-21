"use client";

import { useEffect, useRef, useState } from "react";

import { BUNDLER_IMPORTS, CDN_MARKUP, NPM_INSTALL } from "../data/ecosystem";
import { CopyIcon } from "./Icons";
import { useLabConfiguration } from "./LabExperience";

const snippets = [
  {
    id: "npm",
    label: "npm",
    title: "Install all three",
    code: NPM_INSTALL,
  },
  {
    id: "bundler",
    label: "CSS imports",
    title: "Load the cascade",
    code: BUNDLER_IMPORTS.join("\n"),
  },
  {
    id: "cdn",
    label: "CDN",
    title: "Use immutable CDN links",
    code: CDN_MARKUP,
  },
] as const;

type SnippetId = (typeof snippets)[number]["id"];

export function InstallGuide() {
  const { announce } = useLabConfiguration();
  const [copyLabels, setCopyLabels] = useState<
    Partial<Record<SnippetId, string>>
  >({});
  const copyTimeoutsRef = useRef<Map<SnippetId, number>>(new Map());

  useEffect(() => {
    const copyTimeouts = copyTimeoutsRef.current;
    return () => {
      for (const timeoutId of copyTimeouts.values()) {
        window.clearTimeout(timeoutId);
      }
      copyTimeouts.clear();
    };
  }, []);

  const clearCopyTimeout = (id: SnippetId) => {
    const existingTimeout = copyTimeoutsRef.current.get(id);
    if (existingTimeout === undefined) return;

    window.clearTimeout(existingTimeout);
    copyTimeoutsRef.current.delete(id);
  };

  const scheduleCopyLabelReset = (id: SnippetId) => {
    // Each snippet owns its transient label timer so an older copy action
    // cannot overwrite newer feedback for the same snippet.
    clearCopyTimeout(id);
    const timeoutId = window.setTimeout(() => {
      setCopyLabels((current) => ({ ...current, [id]: "Copy" }));
      copyTimeoutsRef.current.delete(id);
    }, 1_800);
    copyTimeoutsRef.current.set(id, timeoutId);
  };

  const copySnippet = async (id: SnippetId, title: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyLabels((current) => ({ ...current, [id]: "Copied" }));
      announce(`${title} code copied to the clipboard.`);
      scheduleCopyLabelReset(id);
    } catch {
      clearCopyTimeout(id);
      setCopyLabels((current) => ({
        ...current,
        [id]: "Select code to copy",
      }));
      announce(
        `Clipboard access failed. Copy the visible ${title} code manually.`,
      );
    }
  };

  return (
    <section
      className="section-band ly-section"
      id="install"
      aria-labelledby="install-title"
    >
      <div className="ly-wrapper ly-wrapper--xl">
        <div className="section-heading ly-split ly-gap-6">
          <div>
            <p className="section-label">Install</p>
            <h2 id="install-title">Install the complete system</h2>
          </div>
          <p>
            Package installation follows the ecosystem layers. Stylesheet order
            follows the cascade: identity, behavior, then structure.
          </p>
        </div>

        <ol className="install-steps ly-stack ly-gap-0">
          {snippets.map((snippet, index) => {
            const copyLabel = copyLabels[snippet.id] ?? "Copy";

            return (
              <li
                key={snippet.id}
                className="install-step ly-grid ly-md-cols-2 ly-gap-5 ly-py-5"
              >
                <header className="ly-cluster ly-gap-3 ly-items-start">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className="ly-stack ly-gap-1">
                    <small className="eyebrow">{snippet.label}</small>
                    <h3>{snippet.title}</h3>
                  </div>
                </header>
                <div className="snippet-shell ly-surface ly-pad-4 ly-stack ly-gap-3">
                  <pre tabIndex={0}>
                    <code>{snippet.code}</code>
                  </pre>
                  <button
                    className="copy-button interactive-surface"
                    data-surface-variant="subtle"
                    data-surface-level="1"
                    type="button"
                    aria-label={`${copyLabel} ${snippet.title} code`}
                    onClick={() =>
                      copySnippet(snippet.id, snippet.title, snippet.code)
                    }
                  >
                    <CopyIcon />
                    <span>{copyLabel}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
