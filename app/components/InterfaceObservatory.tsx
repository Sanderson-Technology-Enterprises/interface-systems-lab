"use client";

import { useState } from "react";

import { ECOSYSTEM_PACKAGES, type ResourceLink } from "../data/ecosystem";
import { ExternalLinkIcon } from "./Icons";

const resourceLabels: Record<ResourceLink, string> = {
  repository: "Repository",
  wiki: "Wiki",
  npm: "npm package",
  demo: "Live demo",
};

const resourceOrder: readonly ResourceLink[] = [
  "repository",
  "wiki",
  "npm",
  "demo",
];

export function InterfaceObservatory() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPackage = ECOSYSTEM_PACKAGES[selectedIndex];

  return (
    <figure
      className="observatory ly-stack ly-gap-4"
      aria-labelledby="observatory-caption"
    >
      <figcaption id="observatory-caption" className="ly-visually-hidden">
        Interface Observatory: choose structure, identity, or behavior to
        inspect the matching CSS package.
      </figcaption>

      <div
        className="observatory-stage"
        aria-label="Interface layer selector"
        role="group"
      >
        {ECOSYSTEM_PACKAGES.map((pkg) => (
          <span
            className={`orbit-ring orbit-ring-${pkg.layer.toLowerCase()}`}
            key={`${pkg.name}-ring`}
            aria-hidden="true"
          >
            <span className="orbit-runner">
              <i />
            </span>
          </span>
        ))}
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <button
            className={`observatory-orbit observatory-orbit-${pkg.layer.toLowerCase()}`}
            type="button"
            key={pkg.name}
            aria-pressed={selectedIndex === index}
            aria-controls="observatory-active-package"
            onClick={() => setSelectedIndex(index)}
          >
            <span className="orbit-label">{pkg.layer}</span>
          </button>
        ))}
        <span className="observatory-core">
          <b>One</b>
          <small>interface core</small>
        </span>
      </div>

      <ol
        className="observatory-legend"
        aria-label="Interface Observatory layers"
      >
        {ECOSYSTEM_PACKAGES.map((pkg, index) => (
          <li key={pkg.name} data-active={selectedIndex === index}>
            <span className="layer-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{pkg.layer}</strong>
              <small>{pkg.name}</small>
            </div>
          </li>
        ))}
      </ol>

      <article
        className="observatory-detail ly-surface ly-pad-4 ly-stack ly-gap-3"
        id="observatory-active-package"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="section-label">Selected layer</p>
        <h2>{selectedPackage.layer}</h2>
        <p>{selectedPackage.summary}</p>
        <code>{selectedPackage.attribute}</code>
        <nav aria-label={`${selectedPackage.displayName} resources`}>
          {resourceOrder.map((resource) => (
            <a
              href={selectedPackage.links[resource]}
              key={resource}
              target="_blank"
              rel="noreferrer noopener"
            >
              {resourceLabels[resource]}
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          ))}
        </nav>
      </article>
    </figure>
  );
}
