"use client";

import { useState } from "react";

import {
  BUNDLER_IMPORTS,
  CDN_MARKUP,
  NPM_INSTALL,
} from "../data/ecosystem";
import { CopyIcon } from "./Icons";

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
  const [copyLabels, setCopyLabels] = useState<Partial<Record<SnippetId, string>>>({});

  const copySnippet = async (id: SnippetId, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyLabels((current) => ({ ...current, [id]: "Copied" }));
      window.setTimeout(() => {
        setCopyLabels((current) => ({ ...current, [id]: "Copy" }));
      }, 1800);
    } catch {
      setCopyLabels((current) => ({
        ...current,
        [id]: "Select code to copy",
      }));
    }
  };

  return (
    <section className="install-section ly-section" id="install" aria-labelledby="install-title">
      <div className="ly-wrapper ly-wrapper--xl">
        <div className="section-heading install-heading">
          <div>
            <p className="section-label">Install</p>
            <h2 id="install-title">Install the complete system</h2>
          </div>
          <p>
            Package installation follows the ecosystem layers. Stylesheet
            order follows the cascade: identity, behavior, then structure.
          </p>
        </div>

        <ol className="install-steps">
          {snippets.map((snippet, index) => {
            const copyLabel = copyLabels[snippet.id] ?? "Copy";

            return (
              <li key={snippet.id} className="install-step">
                <header>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{snippet.label}</small>
                    <h3>{snippet.title}</h3>
                  </div>
                </header>
                <div className="snippet-shell">
                  <pre tabIndex={0}>
                    <code>{snippet.code}</code>
                  </pre>
                  <button
                    className="copy-button interactive-surface"
                    data-surface-variant="subtle"
                    type="button"
                    aria-label={`${copyLabel} ${snippet.title} code`}
                    onClick={() => copySnippet(snippet.id, snippet.code)}
                  >
                    <CopyIcon />
                    <span>{copyLabel}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {Object.values(copyLabels).find((label) => label === "Copied")
            ? "Installation code copied to the clipboard."
            : ""}
        </p>
      </div>
    </section>
  );
}
