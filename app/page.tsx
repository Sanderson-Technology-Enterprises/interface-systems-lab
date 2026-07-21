"use client";

import { useState } from "react";

import { ArrowRightIcon, ExternalLinkIcon } from "./components/Icons";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { InstallGuide } from "./components/InstallGuide";
import { InterfaceObservatory } from "./components/InterfaceObservatory";
import { LabControls } from "./components/LabControls";
import { LabExperience, useLabConfiguration } from "./components/LabExperience";
import { LibraryDirectory } from "./components/LibraryDirectory";
import { ECOSYSTEM_PACKAGES } from "./data/ecosystem";
import { configurationMarkup } from "./lib/configuration";
import { SITE } from "./lib/site";

export default function Home() {
  return (
    <LabExperience>
      <HomeContent />
    </LabExperience>
  );
}

function HomeContent() {
  const { configuration: lab, announce } = useLabConfiguration();
  const [saved, setSaved] = useState(false);
  const configMarkup = configurationMarkup(lab);
  const modeLabel =
    lab.mode === "contrast"
      ? "High contrast"
      : `${lab.mode.charAt(0).toUpperCase()}${lab.mode.slice(1)}`;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header ly-header ly-header--sticky">
        <div className="site-header-inner ly-wrapper ly-wrapper--xl">
          <a
            className="brand ly-cluster ly-gap-2"
            href="#top"
            aria-label="Interface Systems Lab home"
          >
            {/* Static export requires a relative public asset path under the GitHub Pages project route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo"
              src={SITE.brandLogoPath}
              width="48"
              height="48"
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
            />
            <span className="brand-copy">
              <span className="brand-title">{SITE.name}</span>
              <span className="brand-owner">{SITE.productLine}</span>
            </span>
          </a>

          <nav
            className="primary-nav ly-cluster ly-gap-4"
            aria-label="Primary navigation"
          >
            <a href="#workbench">Workbench</a>
            <a href="#install">Install</a>
            <a href="#libraries">Libraries</a>
            <a href="#architecture">Architecture</a>
            <a href={SITE.repository} target="_blank" rel="noreferrer noopener">
              GitHub
              <ExternalLinkIcon />
              <span className="ly-visually-hidden"> (opens in a new tab)</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero ly-wrapper ly-wrapper--xl ly-section" id="top">
          <div className="hero-copy ly-stack ly-gap-5">
            <h1>
              Design every layer.
              <br />
              <em>Keep one interface.</em>
            </h1>
            <p className="lede">
              Combine structure, visual identity, and interaction without
              rebuilding your markup.
            </p>
            <div className="ly-button-group">
              <a
                className="interactive-surface size-lg"
                data-surface-variant="primary"
                data-surface-level="2"
                href="#workbench"
              >
                Open the workbench
                <ArrowRightIcon />
              </a>
              <a
                className="interactive-surface size-lg"
                data-surface-variant="subtle"
                data-surface-level="1"
                href={SITE.repository}
                target="_blank"
                rel="noreferrer noopener"
              >
                View on GitHub
                <ExternalLinkIcon />
                <span className="ly-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </div>
          </div>

          <InterfaceObservatory />
        </section>

        <section
          className="section-band ly-section"
          id="workbench"
          aria-labelledby="workbench-title"
        >
          <div className="ly-wrapper ly-wrapper--xl">
            <div className="section-heading">
              <p className="section-label">Live workbench</p>
              <h2 id="workbench-title">The client-ready workbench</h2>
              <p>
                Change any control. The product shell, native elements, and
                interactive states update together.
              </p>
            </div>

            <LabControls />

            <div
              className="product-preview ly-surface"
              aria-label="Interactive client portal example"
            >
              <aside className="preview-sidebar ly-surface">
                <div className="preview-logo" aria-hidden="true">
                  A
                </div>
                <div>
                  <strong>Atelier One</strong>
                  <small className="muted-copy">Client workspace</small>
                </div>
                <nav aria-label="Example portal navigation">
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    aria-current="page"
                    href="#preview-dashboard"
                  >
                    Overview
                  </a>
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    href="#preview-projects"
                  >
                    Projects
                  </a>
                  <a
                    className="interactive-surface"
                    data-surface-variant="subtle"
                    href="#preview-insights"
                  >
                    Insights
                  </a>
                </nav>
              </aside>

              <section className="preview-main" id="preview-dashboard">
                <header className="preview-header">
                  <div>
                    <small className="muted-copy">Interface preview</small>
                    <h3>Atelier One workspace</h3>
                  </div>
                  <span className="preview-mode">{modeLabel} mode</span>
                </header>

                <dl className="metric-rail" id="preview-insights">
                  <div>
                    <dt className="muted-copy">Active projects</dt>
                    <dd>08</dd>
                  </div>
                  <div>
                    <dt className="muted-copy">On-time delivery</dt>
                    <dd>96%</dd>
                  </div>
                  <div>
                    <dt className="muted-copy">Client rating</dt>
                    <dd>4.9</dd>
                  </div>
                </dl>

                <div className="preview-cards" id="preview-projects">
                  <article className="ly-surface ly-pad-5 ly-stack ly-gap-3">
                    <div className="meta-line">
                      <span>Featured project</span>
                      <span>72%</span>
                    </div>
                    <h4>Northstar brand system</h4>
                    <p className="muted-copy">
                      Identity refresh, digital guidelines, and component
                      foundations.
                    </p>
                    <progress value="72" max="100">
                      72%
                    </progress>
                    <div className="card-actions ly-cluster ly-gap-2">
                      <button
                        className="interactive-surface"
                        data-surface-variant="primary"
                        type="button"
                        onClick={() =>
                          announce(
                            "Project details opened in the demonstration.",
                          )
                        }
                      >
                        View project
                      </button>
                      <button
                        className="interactive-surface"
                        data-surface-variant="subtle"
                        type="button"
                        aria-label={
                          saved
                            ? "Remove project from shortlist"
                            : "Save project to shortlist"
                        }
                        aria-pressed={saved}
                        onClick={() => {
                          setSaved((value) => !value);
                          announce(
                            saved
                              ? "Project removed from shortlist."
                              : "Project saved to shortlist.",
                          );
                        }}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </article>

                  <aside className="ly-surface ly-pad-5 ly-stack ly-gap-3">
                    <small className="eyebrow">Interaction states</small>
                    <h4>Hover. Focus. Press.</h4>
                    <p className="muted-copy">
                      Primary, secondary, warning, and disabled states inherit
                      the active style system.
                    </p>
                    <div className="state-actions ly-cluster ly-gap-2">
                      <button
                        className="interactive-surface size-sm"
                        data-surface-variant="secondary"
                        type="button"
                      >
                        Secondary
                      </button>
                      <button
                        className="interactive-surface size-sm"
                        data-surface-variant="warning"
                        type="button"
                      >
                        Warning
                      </button>
                      <button
                        className="interactive-surface size-sm"
                        type="button"
                        disabled
                      >
                        Disabled
                      </button>
                    </div>
                  </aside>
                </div>
              </section>
            </div>
          </div>
        </section>

        <FeatureShowcase />
        <InstallGuide />
        <LibraryDirectory />

        <section
          className="section-band ly-section"
          id="architecture"
          aria-labelledby="architecture-title"
        >
          <div className="ly-wrapper ly-wrapper--xl">
            <div className="section-heading">
              <p className="section-label">Architecture</p>
              <h2 id="architecture-title">
                Three layers. One shared contract.
              </h2>
              <p>
                Each package owns one concern, so geometry, identity, and
                behavior can evolve independently.
              </p>
            </div>
            <ol className="architecture-list">
              {ECOSYSTEM_PACKAGES.map((pkg, index) => (
                <li
                  className="ly-surface ly-pad-5 ly-stack ly-gap-3"
                  key={pkg.name}
                >
                  <span className="package-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="ly-stack ly-gap-1">
                    <small className="eyebrow">{pkg.layer}</small>
                    <h3>{pkg.name}</h3>
                  </div>
                  <p className="muted-copy">{pkg.summary}</p>
                  <code>{pkg.attribute}</code>
                </li>
              ))}
            </ol>
            <div className="root-contract ly-surface ly-stack ly-gap-2 ly-pad-4">
              <small className="eyebrow">Root markup</small>
              <code>{configMarkup}</code>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner ly-wrapper ly-wrapper--xl">
          <div className="footer-brand ly-cluster ly-gap-3">
            {/* Static export requires a relative public asset path under the GitHub Pages project route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="footer-logo"
              src={SITE.brandLogoPath}
              width="56"
              height="56"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <p>
              <strong>{SITE.name}</strong>
              <small className="muted-copy">{SITE.productLine}</small>
              <small className="muted-copy">
                One semantic interface. Three focused CSS layers.
              </small>
            </p>
          </div>
          <a
            className="ly-cluster ly-gap-1"
            href={SITE.repository}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub repository
            <ExternalLinkIcon />
            <span className="ly-visually-hidden"> (opens in a new tab)</span>
          </a>
          <nav className="footer-package-links" aria-label="Package links">
            {ECOSYSTEM_PACKAGES.map((pkg) => (
              <a
                key={pkg.name}
                href={pkg.links.npm}
                target="_blank"
                rel="noreferrer noopener"
              >
                {pkg.name}
                <span className="ly-visually-hidden">
                  {" "}
                  on npm (opens in a new tab)
                </span>
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
